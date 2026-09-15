import { useState } from 'react';
import type { Appointment } from 'fhir/r4';
import { ArrowUpDown, CalendarDays, ChevronRight } from 'lucide-react';
import { displayDate } from '../services/dates';
import { EmptyState, StatusBadge, StepHeading } from './Shared';

export function AppointmentList({ appointments, selectedId, onSelect, next, onMore, busy }: { appointments: Appointment[]; selectedId?: string; onSelect: (a: Appointment) => void; next?: string; onMore: () => void; busy: boolean }) {
  const [filter, setFilter] = useState('all'); const [ascending, setAscending] = useState(false);
  const sorted = appointments.filter(a => filter === 'all' || (filter === 'upcoming' ? !!a.start && Date.parse(a.start) >= Date.now() : a.status === filter)).slice().sort((a, b) => {
    const first = a.start ? Date.parse(a.start) : NaN; const second = b.start ? Date.parse(b.start) : NaN;
    if (!Number.isFinite(first)) return 1; if (!Number.isFinite(second)) return -1;
    return ascending ? first - second : second - first;
  });
  return <section className="panel appointment-panel"><div className="panel-heading"><StepHeading number="02" title="Ses rendez-vous" caption={`${appointments.length} rendez-vous chargé${appointments.length > 1 ? 's' : ''} depuis FHIR`} /><div className="toolbar"><label><span className="sr-only">Filtrer les rendez-vous</span><select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Tous les rendez-vous</option><option value="upcoming">À venir</option><option value="booked">Confirmés</option><option value="cancelled">Annulés</option><option value="fulfilled">Terminés</option></select></label><button className="icon-button" title="Inverser le tri chronologique" aria-label="Inverser le tri chronologique" onClick={() => setAscending(!ascending)}><ArrowUpDown size={17} /></button></div></div>
    {!sorted.length ? <EmptyState title={appointments.length ? 'Aucun rendez-vous pour ce filtre' : 'Aucun rendez-vous'}>Le serveur n’a retourné aucun rendez-vous correspondant. Vous pouvez actualiser la liste.</EmptyState> : <div className="table-scroll"><table className="appointments-table"><thead><tr><th>DATE ET HEURE · FUSEAU SOURCE</th><th>RENDEZ-VOUS / SERVICE</th><th>STATUT</th><th><span className="sr-only">Sélection</span></th></tr></thead><tbody>{sorted.map((a, i) => <tr key={a.id ?? i} className={selectedId && selectedId === a.id ? 'selected-row' : ''}><td><div className="date-cell"><span className="calendar-icon"><CalendarDays size={18} /></span><div><strong>{displayDate(a.start)}</strong><small>{a.end ? `Fin : ${displayDate(a.end)}` : 'Fin non renseignée'}</small></div></div></td><td><strong>{a.description || a.serviceType?.[0]?.text || a.serviceType?.[0]?.coding?.[0]?.display || a.appointmentType?.text || 'Libellé non renseigné'}</strong><small>Appointment/{a.id ?? 'ID absent'}</small></td><td><StatusBadge status={a.status} /></td><td><button className="row-button" disabled={!a.id || busy} onClick={() => onSelect(a)} aria-label={`Voir le rendez-vous ${a.id ?? ''}`}><ChevronRight size={18} /></button></td></tr>)}</tbody></table></div>}
    {next && <div className="panel-bottom"><p>Une autre page de résultats est disponible.</p><button className="button small" onClick={onMore} disabled={busy}>Charger la suite</button></div>}
  </section>;
}
