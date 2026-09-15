import type { ReactNode } from 'react';
import { AlertCircle, ArrowRight, CalendarDays, LoaderCircle } from 'lucide-react';
import { STATUS_LABELS } from '../services/terminology';

export function EmptyState({ title, children, icon }: { title: string; children: ReactNode; icon?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon ?? <CalendarDays size={27} />}</div><h3>{title}</h3><p>{children}</p></div>;
}
export function Alert({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return <div className="alert" role="alert"><AlertCircle size={20} /><div>{children}</div>{onRetry && <button className="button small" onClick={onRetry}>Réessayer</button>}</div>;
}
export function Loading({ children = 'Chargement en cours…' }: { children?: ReactNode }) {
  return <div className="loading" role="status"><LoaderCircle size={19} className="spin" />{children}</div>;
}
export function StatusBadge({ status }: { status?: string }) {
  return <span className={`badge status-${status ?? 'absent'}`}><span className="dot" />{status ? STATUS_LABELS[status] ?? status : 'Non renseigné'}</span>;
}
export function StepHeading({ number, title, caption }: { number: string; title: string; caption?: string }) {
  return <div className="step-heading"><span className="step-number">{number}</span><div><h2>{title}</h2>{caption && <p>{caption}</p>}</div></div>;
}
export function Flow() {
  return <div className="flow"><span><i className="source-dot" />FHIR R4</span><ArrowRight size={14} /><span>Normalisation</span><ArrowRight size={14} /><span>HL7 v2.5.1<i className="target-dot" /></span></div>;
}
export function download(content: string, filename: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a');
  link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
