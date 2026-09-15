import { ArrowRight, Clock3, MapPin, Stethoscope, Building2, CalendarCheck2 } from 'lucide-react';
import type { NormalizedContext } from '../models/normalizedModel';
import { conceptLabel } from '../services/normalizer';
import { displayDate } from '../services/dates';
import { Alert, StatusBadge } from './Shared';

export function AppointmentDetail({ context, onConvert }: { context: NormalizedContext; onConvert: () => void }) {
  const a = context.appointment;
  const practitioners = a.participants.filter(p => p.kind === 'Practitioner'); const locations = a.participants.filter(p => p.kind === 'Location'); const services = a.participants.filter(p => p.kind === 'HealthcareService');
  const value = (v?: string) => v || <span className="missing">Non renseigné</span>;
  return <section className="panel detail-panel"><div className="panel-heading"><div className="detail-title"><span className="detail-icon"><CalendarCheck2 size={23} /></span><div><div className="eyebrow">RENDEZ-VOUS SÉLECTIONNÉ</div><h2>{a.description || conceptLabel(a.type) !== 'Non renseigné' && conceptLabel(a.type) || 'Détail du rendez-vous'}</h2></div></div><StatusBadge status={a.status} /></div>
    <div className="detail-grid"><div className="detail-item"><Clock3 size={18} /><div><label>Début et fin</label><strong>{displayDate(a.start)}</strong><span>{displayDate(a.end)}</span><small>{a.duration ? `${a.duration.minutes} min · ${a.duration.source === 'explicit' ? 'durée fournie' : 'durée calculée'}` : 'Durée non renseignée'}</small></div></div><div className="detail-item"><Stethoscope size={18} /><div><label>Professionnel</label>{practitioners.length ? practitioners.map((p, i) => <strong key={i}>{value(p.display)}{!p.resolved && <small>Référence non résolue</small>}</strong>) : value()}</div></div><div className="detail-item"><MapPin size={18} /><div><label>Lieu</label>{locations.length ? locations.map((p, i) => <strong key={i}>{value(p.display)}{!p.resolved && <small>Référence non résolue</small>}</strong>) : value()}</div></div><div className="detail-item"><Building2 size={18} /><div><label>Service</label>{a.services.length ? a.services.map((c, i) => <strong key={i}>{conceptLabel(c)}</strong>) : services.length ? services.map((p, i) => <strong key={i}>{value(p.display)}</strong>) : value()}</div></div></div>
    <dl className="detail-meta"><div><dt>Identifiant métier du rendez-vous</dt><dd>{value(a.identifiers.map(id => id.value).join(', '))}</dd></div><div><dt>Type de rendez-vous</dt><dd>{value(a.type ? conceptLabel(a.type) : undefined)}</dd></div><div><dt>Motif</dt><dd>{value(a.reasons.map(conceptLabel).join(' · '))}</dd></div><div><dt>Catégorie / spécialité</dt><dd>{value([...a.categories, ...a.specialties].map(conceptLabel).join(' · '))}</dd></div><div><dt>Organisation du professionnel</dt><dd>{value(a.organizations.map(o => o.name).filter(Boolean).join(' · '))}</dd></div></dl>
    {!!a.errors.length && <Alert>{a.errors.map((error, i) => <div key={i}>{error}</div>)}</Alert>}
    {!!a.warnings.length && <details className="warning-details"><summary>{a.warnings.length} point{a.warnings.length > 1 ? 's' : ''} d’attention sur les données source</summary><ul>{a.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></details>}
    <div className="panel-bottom"><span>Source : <code>Appointment/{a.id}</code></span><button className="button primary" onClick={onConvert}>Préparer la conversion<ArrowRight size={16} /></button></div>
  </section>;
}
