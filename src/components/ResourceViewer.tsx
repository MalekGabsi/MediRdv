import { useState } from 'react';
import { Braces, Database, ExternalLink } from 'lucide-react';
import type { SourceResource } from '../services/fhirApi';
import { EmptyState } from './Shared';

export function ResourceViewer({ sources }: { sources: SourceResource[] }) {
  const [selected, setSelected] = useState('');
  const unique = [...new Map(sources.map(source => [`${source.resource.resourceType}/${source.resource.id ?? 'metadata'}`, source])).entries()];
  const active = unique.find(([key]) => key === selected) ?? unique[0];
  if (!active) return <section className="panel"><EmptyState title="Aucune ressource chargée" icon={<Database size={28} />}>Les ressources réellement reçues du serveur apparaîtront ici avec leur provenance.</EmptyState></section>;
  const [key, source] = active;
  return <section className="panel resource-viewer"><div className="resource-list"><div className="section-label">RESSOURCES REÇUES<span>{unique.length}</span></div>{unique.map(([id, item]) => <button key={id} className={id === key ? 'active' : ''} onClick={() => setSelected(id)}><Braces size={17} /><span><strong>{item.resource.resourceType}</strong><small>{item.resource.id ?? 'Métadonnées du serveur'}</small></span></button>)}</div><div className="resource-content"><div className="panel-heading"><div><h2>{source.resource.resourceType}</h2><p>{source.resource.id ?? 'CapabilityStatement'}</p></div><span className="badge">FHIR R4 · JSON</span></div><div className="source-provenance"><span>Reçu le {new Date(source.fetchedAt).toLocaleString('fr-FR')}</span><a href={source.url} target="_blank" rel="noreferrer">Requête source<ExternalLink size={13} /></a></div>{source.resource.meta?.profile?.length ? <div className="profile-note">Profils déclarés : {source.resource.meta.profile.join(', ')}. Validation de ces profils hors MVP.</div> : <div className="profile-note">Aucun profil déclaré dans meta.profile.</div>}<pre className="json-code" aria-label="Ressource FHIR source">{JSON.stringify(source.resource, null, 2)}</pre></div></section>;
}
