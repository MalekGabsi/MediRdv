import { useEffect, useMemo, useRef, useState } from 'react';
import type { Appointment, Patient } from 'fhir/r4';
import { Activity, ArrowRight, ArrowRightLeft, Braces, CalendarDays, Check, ChevronRight, CircleHelp, Database, ExternalLink, GitCompareArrows, HeartPulse, History, RefreshCw, ShieldCheck, UserRound, X } from 'lucide-react';
import { FhirApi, FHIR_BASE, errorMessage, type Capabilities, type RequestTrace, type SearchPage, type SourceResource } from './services/fhirApi';
import { normalize, normalizePatient } from './services/normalizer';
import { resolveParticipants } from './services/references';
import { displayDate } from './services/dates';
import type { NormalizedContext, TransformationResult } from './models/normalizedModel';
import { PatientSearch } from './components/PatientSearch';
import { AppointmentList } from './components/AppointmentList';
import { AppointmentDetail } from './components/AppointmentDetail';
import { HL7Preview } from './components/HL7Preview';
import { ResourceViewer } from './components/ResourceViewer';
import { TerminologyView } from './components/TerminologyView';
import { Alert, EmptyState, Flow, Loading } from './components/Shared';
import styles from './App.module.css';

type Tab = 'appointments' | 'resources' | 'conversion' | 'terminology' | 'exchanges';
const navigation = [
  { id: 'appointments' as const, label: 'Rendez-vous', icon: CalendarDays },
  { id: 'resources' as const, label: 'Ressources FHIR', icon: Braces },
  { id: 'conversion' as const, label: 'Conversion HL7', icon: ArrowRightLeft },
  { id: 'terminology' as const, label: 'Terminologies', icon: GitCompareArrows },
  { id: 'exchanges' as const, label: 'Journal des échanges', icon: History },
];
const titles: Record<Tab, { title: string; description: string }> = {
  appointments: { title: 'Rendez-vous patient', description: 'Retrouvez un patient, consultez son agenda et préparez son échange HL7.' },
  resources: { title: 'Ressources FHIR', description: 'Explorez les données réellement reçues et leur provenance sur le serveur.' },
  conversion: { title: 'Conversion HL7 v2', description: 'Transformez un rendez-vous avec des règles explicites et un audit détaillé.' },
  terminology: { title: 'Alignements terminologiques', description: 'Suivez le passage des codes source vers leur représentation cible.' },
  exchanges: { title: 'Journal des échanges', description: 'Vérifiez les appels au serveur, leur résultat et leur temps de réponse.' },
};

export default function App() {
  const [tab, setTab] = useState<Tab>('appointments'); const [traces, setTraces] = useState<RequestTrace[]>([]);
  const api = useMemo(() => new FhirApi(FHIR_BASE, trace => setTraces(previous => [trace, ...previous].slice(0, 100))), []);
  const [capabilities, setCapabilities] = useState<Capabilities>(); const [connectionError, setConnectionError] = useState(''); const [connecting, setConnecting] = useState(true); const [retryConnection, setRetryConnection] = useState(0);
  const [patient, setPatient] = useState<Patient>(); const [patientSource, setPatientSource] = useState<SourceResource>();
  const [appointmentPage, setAppointmentPage] = useState<SearchPage<Appointment>>(); const [sources, setSources] = useState<SourceResource[]>([]);
  const [appointmentsBusy, setAppointmentsBusy] = useState(false); const [appointmentsError, setAppointmentsError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment>(); const [context, setContext] = useState<NormalizedContext>(); const [detailBusy, setDetailBusy] = useState(false); const [detailError, setDetailError] = useState('');
  const [result, setResult] = useState<TransformationResult>(); const [showHelp, setShowHelp] = useState(false);
  const listController = useRef<AbortController | null>(null); const detailController = useRef<AbortController | null>(null);
  useEffect(() => {
    const active = new AbortController(); setConnecting(true); setConnectionError(''); setCapabilities(undefined);
    void api.capabilities(active.signal).then(setCapabilities).catch(error => { if (!active.signal.aborted) setConnectionError(errorMessage(error)); }).finally(() => { if (!active.signal.aborted) setConnecting(false); });
    return () => active.abort();
  }, [api, retryConnection]);
  useEffect(() => () => { listController.current?.abort(); detailController.current?.abort(); }, []);

  async function loadAppointments(p: Patient, source: SourceResource, append = false) {
    listController.current?.abort(); const active = new AbortController(); listController.current = active;
    setAppointmentsBusy(true); setAppointmentsError('');
    if (!append) { detailController.current?.abort(); setDetailBusy(false); setDetailError(''); setAppointmentPage(undefined); setSources([source]); setContext(undefined); setSelectedAppointment(undefined); setResult(undefined); }
    try {
      const response = append && appointmentPage?.next ? await api.page<Appointment>(appointmentPage.next, 'Appointment', active.signal) : await api.appointments(p.id!, !!capabilities?.actorInclude, active.signal);
      if (active.signal.aborted) return;
      setAppointmentPage(previous => { const ids = new Set(previous?.resources.map(a => a.id)); return append && previous ? { ...response, resources: [...previous.resources, ...response.resources.filter(a => !ids.has(a.id))], sources: [...previous.sources, ...response.sources], warnings: [...previous.warnings, ...response.warnings] } : response; });
      setSources(previous => [...(append ? previous : [source]), ...response.sources]);
    } catch (error) { if (!active.signal.aborted) setAppointmentsError(errorMessage(error)); }
    finally { if (!active.signal.aborted) setAppointmentsBusy(false); }
  }
  function selectPatient(p: Patient, source: SourceResource) { setPatient(p); setPatientSource(source); void loadAppointments(p, source); }
  async function selectAppointment(a: Appointment) {
    detailController.current?.abort(); const active = new AbortController(); detailController.current = active;
    setSelectedAppointment(a); setContext(undefined); setResult(undefined); setDetailBusy(true); setDetailError('');
    try {
      const resolved = await resolveParticipants(api, a, sources, active.signal);
      if (active.signal.aborted) return;
      const all = [...sources, ...resolved.sources]; setSources(previous => [...previous, ...resolved.sources]); setContext(normalize(patient!, a, all, api.base, resolved.warnings));
    } catch (error) { if (!active.signal.aborted) setDetailError(errorMessage(error)); }
    finally { if (!active.signal.aborted) setDetailBusy(false); }
  }
  function clearPatient() { listController.current?.abort(); detailController.current?.abort(); setPatient(undefined); setPatientSource(undefined); setSources([]); setAppointmentPage(undefined); setContext(undefined); setSelectedAppointment(undefined); setResult(undefined); setDetailBusy(false); setAppointmentsError(''); setDetailError(''); setTab('appointments'); }
  const normalizedPatient = patient ? normalizePatient(patient) : undefined;
  const allSources = [...sources, ...(capabilities ? [capabilities.source] : [])];
  const connectionStatus = connecting ? 'Connexion en cours' : connectionError ? 'Connexion indisponible' : 'Serveur connecté';
  return <div className={styles.shell}>
    <aside className={styles.sidebar}><a className="brand" href="#" onClick={event => { event.preventDefault(); setTab('appointments'); }}><span className="brand-icon"><HeartPulse size={24} /></span><span>Medi<span className="brand-light">Rdv</span><small>CONNECTER LES PARCOURS</small></span></a>
      <div className="workspace-label">ESPACE DE TRAVAIL</div><nav aria-label="Navigation principale">{navigation.map(item => <button key={item.id} className={`nav-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)} aria-current={tab === item.id ? 'page' : undefined}><item.icon size={19} /><span>{item.label}</span>{tab === item.id && <span className="nav-active-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-server"><span className="server-icon"><Database size={19} /></span><div><strong>HAPI FHIR R4</strong><small>Serveur public de test</small></div><span className={`connection-dot ${capabilities ? 'online' : 'offline'}`} /></div><div className="sidebar-note"><ShieldCheck size={15} /><span>Consultation uniquement<br />Données de test du serveur</span></div><button className="help-button" onClick={() => setShowHelp(true)}><CircleHelp size={18} />Guide du prototype<ExternalLink size={13} /></button></div>
    </aside>
    <div className={styles.workspace}><header className={styles.topbar}><div className="breadcrumbs">Espace d’interopérabilité<ChevronRight size={14} /><strong>{navigation.find(n => n.id === tab)?.label}</strong></div><div className={`connection-label ${connectionError ? 'has-error' : ''}`}><span className={`connection-dot ${capabilities ? 'online' : 'offline'}`} />{connectionStatus}<span className="version-tag">R4</span></div></header>
      <main className={styles.main}><div className="page-heading"><div><div className="eyebrow">FHIR SOURCE · HL7 CIBLE</div><h1>{titles[tab].title}</h1><p>{titles[tab].description}</p></div><span className="prototype-tag"><Activity size={14} />Prototype d’interopérabilité</span></div>
        <div className="server-strip"><span><Database size={15} /><strong>HAPI FHIR R4</strong><a href={api.base} target="_blank" rel="noreferrer">{api.base}<ExternalLink size={12} /></a></span><span>{capabilities ? <><Check size={14} />FHIR {capabilities.fhirVersion} vérifié</> : 'Vérification des capacités du serveur'}</span></div>
        {connectionError && <Alert onRetry={() => setRetryConnection(value => value + 1)}>{connectionError}</Alert>}
        {normalizedPatient && <section className="patient-banner" aria-label="Patient sélectionné"><div className="avatar"><UserRound size={25} /></div><div className="patient-identity"><div className="eyebrow">PATIENT SÉLECTIONNÉ<Check size={12} /></div><h2>{normalizedPatient.display}</h2><div><span>Naissance : {displayDate(normalizedPatient.birthDate)}</span><i /> <span>ID FHIR : <code>{normalizedPatient.id}</code></span><i /><span>Identifiant métier : {normalizedPatient.identifiers[0]?.value ?? 'Non renseigné'}</span></div></div><button className="button small" onClick={clearPatient}>Changer de patient</button></section>}
        {tab === 'appointments' && <>
          {!patient && <PatientSearch api={api} capabilities={capabilities} disabled={!capabilities || connecting} onSelect={selectPatient} />}
          {patient && <div className="patient-actions"><span><CalendarDays size={15} />Rendez-vous passés et à venir · fuseaux de la source conservés</span><button className="text-button" disabled={appointmentsBusy || !capabilities} onClick={() => void loadAppointments(patient, patientSource!)}><RefreshCw size={15} />Actualiser</button></div>}
          {appointmentsError && <Alert onRetry={() => patient && void loadAppointments(patient, patientSource!)}>{appointmentsError}</Alert>}
          {patient && appointmentsBusy && <Loading>Chargement des rendez-vous depuis HAPI…</Loading>}
          {patient && appointmentPage && <><AppointmentList appointments={appointmentPage.resources} selectedId={selectedAppointment?.id} onSelect={a => void selectAppointment(a)} next={appointmentPage.next} onMore={() => void loadAppointments(patient, patientSource!, true)} busy={appointmentsBusy} />{!!appointmentPage.warnings.length && <p className="warning-text">{appointmentPage.warnings.join(' ')}</p>}</>}
          {patient && detailBusy && <Loading>Résolution des professionnels, lieux et services…</Loading>}
          {detailError && <Alert onRetry={() => selectedAppointment && void selectAppointment(selectedAppointment)}>{detailError}</Alert>}
          {context && !detailBusy && <AppointmentDetail context={context} onConvert={() => setTab('conversion')} />}
          {!patient && <><section className="panel welcome-panel"><div className="welcome-art" aria-hidden="true"><div className="orbit one" /><div className="orbit two" /><div className="floating-icon first"><UserRound size={22} /></div><div className="floating-icon second"><Braces size={22} /></div><span className="welcome-calendar"><CalendarDays size={44} strokeWidth={1.4} /></span><span className="art-check"><Check size={16} /></span></div><div><span className="eyebrow">LE BON PATIENT. LES BONNES INFORMATIONS.</span><h2>Un parcours de données<br />clair et traçable.</h2><p>Sélectionnez un patient pour consulter ses rendez-vous, explorer les ressources source et préparer un message HL7 v2.</p><Flow /></div></section><div className="feature-grid"><div><span className="feature-icon"><CalendarDays size={19} /></span><div><h3>Consulter les rendez-vous</h3><p>Dates, statut et participants disponibles.</p></div><span className="feature-step">01</span></div><div><span className="feature-icon"><Braces size={19} /></span><div><h3>Comprendre la source</h3><p>Ressources FHIR et références utilisées.</p></div><span className="feature-step">02</span></div><div><span className="feature-icon"><ArrowRightLeft size={19} /></span><div><h3>Transformer et vérifier</h3><p>Message HL7, codes et traçabilité.</p></div><span className="feature-step">03</span></div></div></>}
        </>}
        {tab === 'resources' && <ResourceViewer sources={allSources} />}
        {tab === 'conversion' && <HL7Preview key={selectedAppointment?.id ?? 'empty'} context={context} result={result} onResult={setResult} />}
        {tab === 'terminology' && <TerminologyView result={result} />}
        {tab === 'exchanges' && <section className="panel"><div className="panel-heading"><div><h2>Requêtes de cette session</h2><p>Les 100 derniers appels. Les traces techniques excluent les noms, les critères de recherche et le contenu des ressources.</p></div><span className="badge">{traces.length} appels</span></div>{!traces.length ? <EmptyState title="Aucun échange">Les appels FHIR apparaîtront ici.</EmptyState> : <div className="table-scroll"><table><thead><tr><th>HEURE</th><th>OPÉRATION</th><th>RÉSULTAT</th><th>DURÉE</th></tr></thead><tbody>{traces.map(trace => <tr key={trace.id}><td>{new Date(trace.timestamp).toLocaleTimeString('fr-FR')}</td><td><code>{trace.operation}</code></td><td><span className={`badge ${trace.status === 200 ? 'status-booked' : 'status-cancelled'}`}>{trace.status}</span></td><td>{trace.durationMs} ms</td></tr>)}</tbody></table></div>}</section>}
        <footer className="footer"><span><ShieldCheck size={14} />Données source préservées · Aucune donnée absente inventée</span><span>MediRdv<ArrowRight size={12} />FHIR R4 / HL7 v2.5.1</span></footer>
      </main>
    </div>
    {showHelp && <div className="modal-backdrop" onClick={() => setShowHelp(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={event => event.stopPropagation()}><button className="icon-button modal-close" aria-label="Fermer le guide" onClick={() => setShowHelp(false)} autoFocus><X size={20} /></button><span className="detail-icon"><HeartPulse size={25} /></span><h2 id="help-title">Le parcours MediRdv</h2><ol><li>Recherchez un patient par nom, identifiant métier ou ID FHIR. Le bouton « Patients avec rendez-vous » interroge les réservations présentes sur HAPI.</li><li>Sélectionnez explicitement le patient, puis un rendez-vous.</li><li>Consultez le détail et les ressources FHIR reçues.</li><li>Confirmez le scénario de nouvelle réservation et générez le message HL7.</li><li>Consultez les alignements terminologiques, les pertes et l’audit.</li></ol><p>La conversion exige un rendez-vous booked, des identifiants métier patient et rendez-vous, un nom structuré et des dates valides. Les données publiques peuvent être supprimées par HAPI.</p><button className="button primary" onClick={() => setShowHelp(false)}>Commencer<ArrowRight size={16} /></button></section></div>}
  </div>;
}
