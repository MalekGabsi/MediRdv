import type { Appointment, FhirResource, Reference } from 'fhir/r4';
import { FhirApi, type SourceResource } from './fhirApi';

export function referenceKey(reference: string, base: string): string | undefined {
  try {
    const url = new FhirApi(base).safeUrl(reference);
    const path = new URL(url).pathname.slice(new URL(`${base}/`).pathname.length);
    const match = /^([A-Za-z]+)\/([A-Za-z0-9.-]+)(?:\/_history\/([A-Za-z0-9.-]+))?$/.exec(path);
    return match ? `${match[1]}/${match[2]}${match[3] ? `/_history/${match[3]}` : ''}` : undefined;
  } catch { return undefined; }
}
export function makeResourceIndex(sources: SourceResource[], base: string): Map<string, FhirResource> {
  const index = new Map<string, FhirResource>();
  for (const source of sources) {
    const r = source.resource;
    if (r.id) {
      index.set(`${r.resourceType}/${r.id}`, r);
      if (r.meta?.versionId) index.set(`${r.resourceType}/${r.id}/_history/${r.meta.versionId}`, r);
    }
    if (source.fullUrl) {
      const key = source.fullUrl.startsWith('urn:') ? source.fullUrl : referenceKey(source.fullUrl, base);
      if (key) index.set(key, r);
    }
  }
  return index;
}
export function lookupReference(ref: Reference | undefined, owner: FhirResource, index: Map<string, FhirResource>, base: string): FhirResource | undefined {
  if (!ref?.reference) return undefined;
  if (ref.reference.startsWith('#')) return 'contained' in owner ? owner.contained?.find(r => r.id === ref.reference!.slice(1)) : undefined;
  return index.get(ref.reference.startsWith('urn:') ? ref.reference : referenceKey(ref.reference, base) ?? '');
}
export interface Resolution { sources: SourceResource[]; warnings: string[] }
export async function resolveParticipants(api: FhirApi, appointment: Appointment, sources: SourceResource[], signal?: AbortSignal): Promise<Resolution> {
  const index = makeResourceIndex(sources, api.base);
  const resolved: SourceResource[] = []; const warnings: string[] = [];
  const visited = new Set<string>();
  const queue: { ref: Reference; owner: FhirResource; depth: number }[] = (appointment.participant ?? []).flatMap(p => p.actor ? [{ ref: p.actor, owner: appointment, depth: 0 }] : []);
  const allowed = new Set(['Practitioner', 'PractitionerRole', 'Location', 'HealthcareService', 'Organization']);
  while (queue.length) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const item = queue.shift()!; const ref = item.ref.reference;
    if (!ref || visited.has(`${item.owner.resourceType}/${item.owner.id}:${ref}`)) continue;
    visited.add(`${item.owner.resourceType}/${item.owner.id}:${ref}`);
    let resource = lookupReference(item.ref, item.owner, index, api.base);
    const key = referenceKey(ref, api.base);
    const kind = resource?.resourceType ?? key?.split('/')[0];
    if (kind === 'Patient') continue;
    if (!kind || !allowed.has(kind)) { warnings.push(`ERR-REF · Participant ${kind ?? 'externe ou sans type'} non résolu : ${ref}.`); continue; }
    if (!resource && key) {
      try {
        const source = await api.read(key, signal);
        const parts = key.split('/');
        if (source.resource.resourceType !== kind || source.resource.id !== parts[1] || (parts[3] && source.resource.meta?.versionId !== parts[3])) throw new Error('Reference mismatch');
        resolved.push(source); resource = source.resource; index.set(key, resource);
      } catch (error) {
        if (signal?.aborted) throw error;
        warnings.push(`ERR-REF · ${ref} indisponible. Les autres informations restent consultables.`); continue;
      }
    }
    if (resource?.resourceType === 'PractitionerRole' && item.depth < 2) {
      for (const nested of [resource.practitioner, resource.organization, ...(resource.location ?? []), ...(resource.healthcareService ?? [])]) {
        if (nested) queue.push({ ref: nested, owner: resource, depth: item.depth + 1 });
      }
    }
  }
  return { sources: resolved, warnings };
}
