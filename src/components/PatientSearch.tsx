import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Appointment, Patient } from 'fhir/r4';
import { ArrowRight, Search, Users, UserRound } from 'lucide-react';
import { errorMessage, type Capabilities, FhirApi, type SearchPage, type SourceResource } from '../services/fhirApi';
import { normalizePatient } from '../services/normalizer';
import { referenceKey } from '../services/references';
import { displayDate } from '../services/dates';
import { Alert, EmptyState, Loading, StepHeading } from './Shared';

export function PatientSearch({ api, capabilities, onSelect, disabled }: { api: FhirApi; capabilities?: Capabilities; onSelect: (patient: Patient, source: SourceResource) => void; disabled: boolean }) {
  const [query, setQuery] = useState(''); const [mode, setMode] = useState<'name' | 'identifier' | 'id'>('name');
  const [page, setPage] = useState<SearchPage<Patient>>(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [discovery, setDiscovery] = useState(false); const controller = useRef<AbortController | null>(null);
  const lastAction = useRef<() => void>(() => {});
  useEffect(() => () => controller.current?.abort(), []);
  async function discover(url?: string, signal?: AbortSignal): Promise<SearchPage<Patient>> {
    const appointments = await api.page<Appointment>(url ?? 'Appointment?status=booked&_count=12&_include=Appointment:actor', 'Appointment', signal);
    const sources = appointments.sources.filter(source => source.resource.resourceType === 'Patient');
    const seen = new Set(sources.map(source => source.resource.id));
    for (const appointment of appointments.resources) {
      for (const p of appointment.participant ?? []) {
        const key = p.actor?.reference ? referenceKey(p.actor.reference, api.base) : undefined;
        if (!key?.startsWith('Patient/') || seen.has(key.split('/')[1])) continue;
        try { const source = await api.read(key, signal); if (source.resource.resourceType === 'Patient') { sources.push(source); seen.add(source.resource.id); } }
        catch (err) { if (signal?.aborted) throw err; appointments.warnings.push('Un patient référencé n’a pas pu être résolu.'); }
      }
    }
    return { resources: sources.map(source => source.resource as Patient), sources, warnings: appointments.warnings, next: appointments.next };
  }
  async function run(kind: 'search' | 'discover', append = false) {
    controller.current?.abort(); const active = new AbortController(); controller.current = active;
    setBusy(true); setError(''); if (!append) setPage(undefined);
    setDiscovery(kind === 'discover'); lastAction.current = () => { void run(kind, append); };
    try {
      const result = kind === 'discover' ? await discover(append ? page?.next : undefined, active.signal) : append && page?.next ? await api.page<Patient>(page.next, 'Patient', active.signal) : await api.searchPatients(query.trim(), mode, active.signal);
      if (active.signal.aborted) return;
      setPage(previous => {
        if (!append || !previous) return result;
        const existing = new Set(previous.resources.map(resource => resource.id));
        return { ...result, resources: [...previous.resources, ...result.resources.filter(resource => !existing.has(resource.id))], sources: [...previous.sources, ...result.sources], warnings: [...previous.warnings, ...result.warnings] };
      });
    } catch (err) { if (!active.signal.aborted) setError(errorMessage(err)); }
    finally { if (!active.signal.aborted) setBusy(false); }
  }
  const submit = (event: FormEvent) => { event.preventDefault(); if (query.trim()) void run('search'); };
  return <section className="panel search-panel">
    <StepHeading number="01" title="Retrouver un patient" caption="Recherchez une identité, puis confirmez le patient à consulter." />
    <form className="search-form" onSubmit={submit}>
      <label className="search-mode"><span className="sr-only">Rechercher par</span><select value={mode} onChange={event => setMode(event.target.value as typeof mode)}><option value="name" disabled={capabilities && !capabilities.patientSearch.includes('name')}>Nom du patient</option><option value="identifier" disabled={capabilities && !capabilities.patientSearch.includes('identifier')}>Identifiant métier</option><option value="id">ID FHIR</option></select></label>
      <label className="search-input"><Search size={19} /><span className="sr-only">Recherche patient</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder={mode === 'name' ? 'Saisissez un nom…' : mode === 'id' ? 'Saisissez l’ID de la ressource Patient…' : 'Saisissez un identifiant ou système|valeur…'} /></label>
      <button className="button primary" type="submit" disabled={disabled || busy || !query.trim()}><Search size={17} />Rechercher</button>
    </form>
    <div className="search-helper"><span>Les résultats proviennent directement du serveur HAPI.</span><button className="text-button" onClick={() => void run('discover')} disabled={disabled || busy || !capabilities?.actorInclude}><Users size={15} />Patients avec rendez-vous<ArrowRight size={14} /></button></div>
    {error && <Alert onRetry={() => lastAction.current()}>{error}</Alert>}
    {busy && <Loading>Recherche sur le serveur FHIR…</Loading>}
    {page && <div className="search-results"><div className="section-label">{discovery ? 'PATIENTS ISSUS DES RENDEZ-VOUS CONFIRMÉS' : 'RÉSULTATS DE RECHERCHE'}<span>{page.resources.length} patient{page.resources.length > 1 ? 's' : ''} chargé{page.resources.length > 1 ? 's' : ''}{page.total !== undefined ? ` / ${page.total}` : ''}</span></div>
      {page.resources.length === 0 && <EmptyState title="Aucun patient trouvé" icon={<UserRound size={27} />}>Essayez une autre recherche ou chargez la page suivante si elle est disponible.</EmptyState>}
      <div className="patient-results">{page.resources.map((patient, i) => { const p = normalizePatient(patient); return <button key={patient.id ?? i} className="patient-result" disabled={!patient.id} onClick={() => { const source = page.sources.find(s => s.resource.resourceType === 'Patient' && s.resource.id === patient.id); if (source) onSelect(patient, source); }}><div className="avatar small"><UserRound size={19} /></div><div><strong>{p.display}</strong><span>{displayDate(p.birthDate)} · ID {p.id ?? 'absent'}</span><small>{p.identifiers[0]?.value ?? 'Identifiant métier non renseigné'}</small></div><ArrowRight size={17} /><span className="sr-only">Sélectionner ce patient</span></button>; })}</div>
      {!!page.warnings.length && <p className="warning-text">{page.warnings.join(' ')}</p>}
      {page.next && <button className="button pagination" disabled={busy} onClick={() => void run(discovery ? 'discover' : 'search', true)}>Charger la page suivante</button>}
    </div>}
  </section>;
}
