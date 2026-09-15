import type { Appointment, Bundle, CapabilityStatement, FhirResource, OperationOutcome, Patient } from 'fhir/r4';
import { checkResourceShape } from './fhirValidator';

export const FHIR_BASE = (import.meta.env?.VITE_FHIR_BASE_URL || 'https://hapi.fhir.org/baseR4').replace(/\/$/, '');
export interface SourceResource { resource: FhirResource; url: string; fetchedAt: string; fullUrl?: string }
export interface SearchPage<T> { resources: T[]; sources: SourceResource[]; next?: string; total?: number; warnings: string[] }
export interface Capabilities { source: SourceResource; fhirVersion: string; patientSearch: string[]; appointmentPatient: boolean; actorInclude: boolean }
export interface RequestTrace { id: string; timestamp: string; operation: string; status: number | string; durationMs: number }
export class FhirError extends Error {
  constructor(public code: 'ERR-NET' | 'ERR-HTTP' | 'ERR-FHIR' | 'ERR-REF', message: string, public httpStatus?: number) { super(message); this.name = 'FhirError'; }
}
export function errorMessage(error: unknown): string {
  return error instanceof FhirError ? `${error.code} · ${error.message}` : 'Une erreur inattendue est survenue. Veuillez réessayer.';
}
function outcomeWarnings(outcome: OperationOutcome): string[] {
  return (outcome.issue ?? []).map(issue => `FHIR · ${issue.severity} / ${issue.code}`);
}

export class FhirApi {
  constructor(readonly base = FHIR_BASE, private readonly onTrace?: (trace: RequestTrace) => void, private readonly timeoutMs = 18000) {}

  safeUrl(reference: string): string {
    const root = new URL(`${this.base}/`);
    const candidate = new URL(reference, root);
    // HAPI may advertise HTTP links behind its reverse proxy. Upgrade this same host only.
    if (root.protocol === 'https:' && candidate.protocol === 'http:' && candidate.hostname === root.hostname) candidate.protocol = 'https:';
    const inBase = candidate.pathname === root.pathname.slice(0, -1) || candidate.pathname.startsWith(root.pathname);
    if (candidate.origin !== root.origin || !inBase || candidate.username || candidate.password) {
      throw new FhirError('ERR-REF', 'Référence externe au serveur configuré : résolution non autorisée.');
    }
    candidate.hash = '';
    return candidate.href;
  }

  async read(reference: string, signal?: AbortSignal): Promise<SourceResource> {
    const url = this.safeUrl(reference);
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, this.timeoutMs);
    const start = performance.now();
    let status: number | string = 'ERR-NET';
    try {
      const response = await fetch(url, { headers: { Accept: 'application/fhir+json', Prefer: 'handling=strict' }, signal: controller.signal, credentials: 'omit', redirect: 'error', cache: 'no-store' });
      status = response.status;
      if (!response.ok) {
        const messages: Record<number, string> = { 400: 'La recherche a été refusée par le serveur FHIR.', 401: 'Le serveur exige une authentification.', 403: 'Accès à la ressource refusé.', 404: 'La ressource demandée est introuvable.', 429: 'Le serveur reçoit trop de demandes. Réessayez dans quelques instants.' };
        throw new FhirError('ERR-HTTP', messages[response.status] ?? `Le serveur FHIR est indisponible (HTTP ${response.status}). Vous pouvez réessayer.`, response.status);
      }
      if (!/\b(application\/fhir\+json|application\/json)\b/i.test(response.headers.get('content-type') ?? '')) throw new FhirError('ERR-FHIR', 'Le serveur n’a pas retourné de JSON FHIR.');
      let resource: FhirResource;
      try { resource = await response.json(); } catch { throw new FhirError('ERR-FHIR', 'La réponse JSON du serveur est illisible.'); }
      if (!resource || typeof resource !== 'object' || typeof resource.resourceType !== 'string') throw new FhirError('ERR-FHIR', 'La réponse ne contient pas une ressource FHIR.');
      try { checkResourceShape(resource); } catch { throw new FhirError('ERR-FHIR', 'La structure de la réponse FHIR est incompatible avec les champs attendus.'); }
      if (resource.resourceType === 'OperationOutcome') throw new FhirError('ERR-FHIR', `Le serveur a retourné un OperationOutcome (${outcomeWarnings(resource).join(', ')}).`);
      status = response.status;
      return { resource, url, fetchedAt: new Date().toISOString() };
    } catch (error) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      if (error instanceof FhirError) { status = error.code; throw error; }
      throw new FhirError('ERR-NET', controller.signal.aborted ? 'Le serveur FHIR met trop de temps à répondre. Réessayez.' : 'Connexion au serveur FHIR impossible. Vérifiez le réseau et l’accès CORS, puis réessayez.');
    } finally {
      clearTimeout(timer); signal?.removeEventListener('abort', abort);
      // No query strings, resource bodies, names, or clinical text in technical traces.
      const path = new URL(url).pathname.slice(new URL(`${this.base}/`).pathname.length);
      this.onTrace?.({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), operation: `GET ${path.split('/')[0]}${path.includes('/') ? '/{id}' : ''}`, status, durationMs: Math.round(performance.now() - start) });
    }
  }

  async capabilities(signal?: AbortSignal): Promise<Capabilities> {
    const source = await this.read('metadata', signal);
    if (source.resource.resourceType !== 'CapabilityStatement') throw new FhirError('ERR-FHIR', 'Les métadonnées ne sont pas un CapabilityStatement.');
    const cap = source.resource as CapabilityStatement;
    if (cap.fhirVersion !== '4.0.1') throw new FhirError('ERR-FHIR', `Version FHIR incompatible : ${cap.fhirVersion ?? 'absente'}. R4 4.0.1 est requis.`);
    const resources = (cap.rest ?? []).filter(rest => rest.mode === 'server').flatMap(rest => rest.resource ?? []);
    const appointment = resources.find(resource => resource.type === 'Appointment');
    const patient = resources.find(resource => resource.type === 'Patient');
    const appointmentPatient = !!appointment?.searchParam?.some(param => param.name === 'patient');
    if (!appointmentPatient) throw new FhirError('ERR-FHIR', 'Le serveur ne déclare pas Appointment?patient. La recherche des rendez-vous est indisponible.');
    return { source, fhirVersion: cap.fhirVersion, patientSearch: patient?.searchParam?.map(param => param.name) ?? [], appointmentPatient, actorInclude: !!appointment?.searchInclude?.some(value => ['*', 'Appointment:actor'].includes(value)) };
  }

  async page<T extends Patient | Appointment>(reference: string, resourceType: T['resourceType'], signal?: AbortSignal): Promise<SearchPage<T>> {
    const source = await this.read(reference, signal);
    if (source.resource.resourceType !== 'Bundle' || source.resource.type !== 'searchset') throw new FhirError('ERR-FHIR', 'Un Bundle de recherche FHIR était attendu.');
    const bundle = source.resource as Bundle;
    if (bundle.entry !== undefined && !Array.isArray(bundle.entry)) throw new FhirError('ERR-FHIR', 'Le Bundle contient une liste de ressources invalide.');
    const resources: T[] = []; const sources: SourceResource[] = []; const warnings: string[] = [];
    for (const entry of bundle.entry ?? []) {
      const resource = entry.resource;
      if (!resource) continue;
      if (resource.resourceType === 'OperationOutcome') {
        if (resource.issue?.some(issue => ['fatal', 'error'].includes(issue.severity))) throw new FhirError('ERR-FHIR', 'Le Bundle contient un OperationOutcome bloquant.');
        warnings.push(...outcomeWarnings(resource)); continue;
      }
      if (resource.resourceType === resourceType && entry.search?.mode !== 'include') resources.push(resource as T);
      sources.push({ resource, fullUrl: entry.fullUrl, url: source.url, fetchedAt: source.fetchedAt });
    }
    const next = bundle.link?.find(link => link.relation === 'next')?.url;
    return { resources, sources, next: next ? this.safeUrl(next) : undefined, total: bundle.total, warnings };
  }

  async searchPatients(query: string, mode: 'name' | 'identifier' | 'id', signal?: AbortSignal): Promise<SearchPage<Patient>> {
    if (mode === 'id') {
      if (!/^[A-Za-z0-9.-]{1,64}$/.test(query)) throw new FhirError('ERR-FHIR', 'L’ID FHIR doit contenir 1 à 64 lettres, chiffres, points ou tirets.');
      try {
        const source = await this.read(`Patient/${encodeURIComponent(query)}`, signal);
        if (source.resource.resourceType !== 'Patient') throw new FhirError('ERR-FHIR', 'La ressource reçue n’est pas un Patient.');
        return { resources: [source.resource], sources: [source], warnings: [], total: 1 };
      } catch (error) { if (error instanceof FhirError && error.httpStatus === 404) return { resources: [], sources: [], total: 0, warnings: [] }; throw error; }
    }
    return this.page(`Patient?${new URLSearchParams({ [mode]: query, _count: '12' })}`, 'Patient', signal);
  }
  appointments(patientId: string, include: boolean, signal?: AbortSignal) {
    const params = new URLSearchParams({ patient: `Patient/${patientId}`, _count: '25' });
    if (include) params.set('_include', 'Appointment:actor');
    return this.page<Appointment>(`Appointment?${params}`, 'Appointment', signal);
  }
}
