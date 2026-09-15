import type { Concept, EventContext, FieldTrace, HumanName, Identifier, NormalizedContext, Participant, TerminologyAlignment, TransformationResult } from '../models/normalizedModel';
import { toHL7Date, toHL7Instant } from './dates';
import { serializeSegment, validateHL7, type Segment } from './hl7Validator';
import { GENDER_MAP, GENDER_SYSTEM, MAPPING_VERSION, STATUS_MAP, STATUS_SYSTEM } from './terminology';

export function escapeHL7(value: string | number | undefined): string {
  const replacements: Record<string, string> = { '|': '\\F\\', '^': '\\S\\', '~': '\\R\\', '\\': '\\E\\', '&': '\\T\\' };
  return String(value ?? '').replace(/[|^~\\&\x00-\x1f\x7f]/g, char => replacements[char] ?? `\\X${char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()}\\`);
}
const components = (values: (string | number | undefined)[]) => values.map(escapeHL7).join('^').replace(/\^+$/, '');
const currentIdentifiers = (values: Identifier[]) => values.filter(id => id.use !== 'old' && id.value.trim());
function xpn(name: HumanName): string { return components([name.family, name.given[0], name.given.slice(1).join(' '), name.suffix.join(' '), name.prefix.join(' ')]); }

export function mapToHL7(context: NormalizedContext, event: EventContext, options: { now?: Date; correlationId?: string } = {}): TransformationResult {
  const { patient, appointment: a } = context;
  const warnings = [...a.warnings]; const errors = [...a.errors]; const fields: FieldTrace[] = []; const alignments: TerminologyAlignment[] = [];
  const now = options.now ?? new Date(); const correlationId = options.correlationId ?? crypto.randomUUID();
  const timestamp = now.toISOString();
  const finish = (message = ''): TransformationResult => {
    const ws = [...new Set(warnings)]; const es = [...new Set(errors)];
    const status = es.length ? 'FAILED' : ws.length ? 'SUCCESS_WITH_WARNINGS' : 'SUCCESS';
    return { hl7Message: es.length ? '' : message, status, warnings: ws, errors: es, fields, alignments, audit: { correlationId, appointmentId: a.id, patientId: patient.id, fhirVersion: '4.0.1', hl7Version: '2.5.1', mappingVersion: MAPPING_VERSION, timestamp, messageType: 'SIU^S12^SIU_S12', eventContext: event.confirmed ? 'Scénario de nouvelle réservation confirmé explicitement par l’utilisateur' : 'Contexte non confirmé', status, warnings: ws, errors: es } };
  };
  if (event.trigger !== 'S12' || !event.confirmed) errors.push('ERR-MAP · Confirmez le scénario de notification de nouvelle réservation. Le statut FHIR ne détermine pas l’événement.');
  if (a.status !== 'booked') errors.push('ERR-MAP · Le scénario local S12 exige un rendez-vous au statut booked. Les autres états restent consultables.');
  if (!a.patientLinked) errors.push('ERR-DATA · Patient non rattachable au rendez-vous.');
  const patientIds = currentIdentifiers(patient.identifiers); const appointmentIds = currentIdentifiers(a.identifiers);
  const patientNames = patient.names.filter(name => name.family || name.given.length);
  if (!patientIds.length) errors.push('ERR-MAP · PID-3 : identifiant métier Patient.identifier absent. L’ID FHIR ne peut pas le remplacer.');
  if (!appointmentIds.length) errors.push('ERR-MAP · SCH-2 : identifiant métier Appointment.identifier absent. L’ID FHIR ne peut pas le remplacer.');
  if (!patientNames.length) errors.push('ERR-MAP · PID-5 : nom ou prénom structuré absent. Un libellé libre n’est pas découpé arbitrairement.');
  if (!a.start || !a.end) errors.push('ERR-MAP · Le profil S12 exige les dates de début et de fin.');
  let start = ''; let end = '';
  try { if (a.start) start = toHL7Instant(a.start); if (a.end) end = toHL7Instant(a.end); } catch { errors.push('ERR-MAP · Date ou précision temporelle incompatible avec HL7 TS.'); }
  if (errors.length) return finish();
  const segments: Segment[] = [];
  const segment = (name: string) => { const s = { name, fields: {} as Record<number, string> }; segments.push(s); return s; };
  const put = (s: Segment, number: number, value: string, source: string, rule: string) => {
    if (!value) return;
    s.fields[number] = value; const occurrence = segments.filter(item => item.name === s.name).length;
    fields.push({ target: `${s.name}${['AIS', 'AIL', 'AIP'].includes(s.name) ? `[${occurrence}]` : ''}-${number}`, source, rule, value });
  };
  const ce = (c: Concept | undefined, target: string): string => {
    if (!c) { warnings.push(`ABSENT · ${target} non renseigné.`); return ''; }
    const valid = c.coding.filter(code => code.code && code.system);
    const code = valid[0];
    if (c.coding.length > 1) warnings.push(`PERTE · ${c.path} : premier Coding avec system + code retenu pour ${target} ; codages alternatifs omis.`);
    if (!code) {
      const label = c.text ?? c.coding.find(coding => coding.display)?.display;
      warnings.push(`ERR-TERM · ${c.path} sans couple system + code ; seul le texte éventuel est conservé dans ${target}.`);
      return label ? components(['', label]) : '';
    }
    if (c.text && code.display && c.text !== code.display) warnings.push(`PERTE · ${c.path}.text diffère du display ; le display du Coding retenu est utilisé.`);
    alignments.push({ sourceSystem: code.system!, sourceCode: code.code!, targetSystem: code.system!, targetCode: code.code!, target, rule: 'Conservation du code et du système source ; aucun code standard substitué.' });
    return components([code.code, code.display ?? c.text, code.system]);
  };
  const msh = segment('MSH');
  put(msh, 2, '^~\\&', 'Règle locale : séparateurs HL7', 'Encodage ER7 ; MSH-1 = |.');
  put(msh, 3, 'MEDIRDV', 'Configuration du prototype', 'Nom technique de l’application émettrice.');
  put(msh, 7, toHL7Instant(timestamp), 'Horloge applicative', 'Horodatage technique de génération.');
  put(msh, 9, 'SIU^S12^SIU_S12', 'Contexte utilisateur confirmé', 'Notification de nouvelle réservation, jamais déduite du statut.');
  put(msh, 10, escapeHL7(correlationId), 'UUID applicatif', 'Identifiant technique du message.');
  put(msh, 11, 'P', 'Configuration du cahier des charges', 'Processing ID P demandé ; prototype sans émission vers un SI.');
  put(msh, 12, '2.5.1', 'Version cible du profil local', 'HL7 v2.5.1.');
  put(msh, 18, 'UNICODE UTF-8', 'Encodage du fichier généré', 'Déclaration UTF-8, table 0211.');
  const sch = segment('SCH'); const aid = appointmentIds[0];
  put(sch, 2, components([aid.value, aid.system]), aid.path, 'Premier identifiant non ancien ; convention locale : agenda source = filler ; system en EI.2.');
  if (appointmentIds.length > 1) warnings.push('PERTE · Plusieurs identifiants de rendez-vous : seul le premier non ancien est exporté dans SCH-2.');
  if (!aid.system) warnings.push('ABSENT · Appointment.identifier.system absent : autorité SCH-2 non renseignée.');
  put(sch, 6, 'NEW^Notification de nouvelle réservation^99MEDIRDV', 'Contexte utilisateur confirmé', 'Code local NEW, système local 99MEDIRDV.');
  put(sch, 7, ce(a.reasons[0], 'SCH-7'), a.reasons[0]?.path ?? `${a.path}.reasonCode`, 'Premier motif ; CE conserve le système source.');
  if (a.reasons.length > 1) warnings.push('PERTE · SCH-7 non répétable : seul le premier motif est exporté.');
  put(sch, 8, ce(a.type, 'SCH-8'), a.type?.path ?? `${a.path}.appointmentType`, 'appointmentType reste distinct de serviceType.');
  // TQ is retained for compatibility in 2.5.1 and carries timing even without AIS/AIP/AIL.
  put(sch, 11, `^^^${start}^${end}`, `${a.path}.start + ${a.path}.end`, 'TQ.4 début / TQ.5 fin ; fuseaux et précision conservés.');
  const status = a.status ? STATUS_MAP[a.status] : undefined;
  if (status) {
    put(sch, 25, components([status, status, 'HL70278']), `${a.path}.status`, 'Table locale conservatrice vers les valeurs suggérées de HL7 0278.');
    alignments.push({ sourceSystem: STATUS_SYSTEM, sourceCode: a.status!, targetSystem: 'HL70278', targetCode: status, target: 'SCH-25', rule: 'Table locale versionnée ; état uniquement, sans inférence du trigger.' });
  } else warnings.push('ERR-TERM · Statut sans alignement validé : SCH-25 omis.');
  const pid = segment('PID');
  put(pid, 1, '1', 'Règle locale', 'Un patient sélectionné.');
  put(pid, 3, patientIds.map(id => `${escapeHL7(id.value)}^^^${escapeHL7(id.system)}`).join('~'), patientIds.map(id => id.path).join(', '), 'Identifiants non anciens répétés en CX ; system en CX.4.1, convention locale.');
  if (patientIds.some(id => !id.system)) warnings.push('ABSENT · Autorité d’un identifiant patient absente ; CX.4 vide.');
  put(pid, 5, patientNames.map(xpn).join('~'), patientNames.map(name => name.path).join(', '), 'Noms structurés répétés ; family / given / suffix / prefix vers XPN.');
  warnings.push('PERTE · HumanName : usages, périodes et texte libre éventuels ne sont pas exportés dans XPN.');
  if (patient.birthDate) { try { put(pid, 7, toHL7Date(patient.birthDate), `${patient.path}.birthDate`, 'Précision de date conservée ; aucune heure ajoutée.'); } catch { errors.push('ERR-MAP · Patient.birthDate invalide.'); } }
  else warnings.push('ABSENT · Date de naissance non renseignée ; PID-7 vide.');
  if (patient.gender && GENDER_MAP[patient.gender]) {
    put(pid, 8, GENDER_MAP[patient.gender], `${patient.path}.gender`, 'Table locale AdministrativeGender vers Administrative Sex, table 0001.');
    alignments.push({ sourceSystem: GENDER_SYSTEM, sourceCode: patient.gender, targetSystem: 'HL70001', targetCode: GENDER_MAP[patient.gender], target: 'PID-8', rule: 'male→M, female→F, other→O, unknown→U. Alignement administratif local ; sémantique non strictement identique.' });
    warnings.push('SÉMANTIQUE · PID-8 : alignement administratif local du genre FHIR vers Administrative Sex HL7.');
  } else if (patient.gender) errors.push('ERR-TERM · Patient.gender inconnu ; aucun transcodage arbitraire.');
  else warnings.push('ABSENT · Genre administratif absent ; PID-8 vide, sans substitution par unknown.');
  const rgs = segment('RGS'); put(rgs, 1, '1', 'Règle locale', 'Un groupe de ressources pour le rendez-vous.');
  warnings.push('PERTE · Les statuts de participation, rôles et fins de période propres aux participants ne sont pas transposés dans ce profil local.');
  const eligible = (kind: string) => a.participants.filter(p => p.kind === kind && p.resolved && p.status !== 'declined');
  if (a.participants.some(p => p.status === 'declined' && p.kind !== 'Patient')) warnings.push('PERTE · Les participants ayant décliné sont omis des ressources planifiées.');
  const services = [...a.services];
  for (const p of eligible('HealthcareService')) { warnings.push(`PERTE · ${p.path} : contexte de service conservé dans FHIR ; seuls les types de service sont exportés.`); services.push(...p.concepts); }
  for (const service of services) {
    const value = ce(service, 'AIS-3');
    if (!value) continue;
    const ais = segment('AIS');
    put(ais, 1, String(segments.filter(s => s.name === 'AIS').length), 'Index de service', 'Numérotation des répétitions.');
    put(ais, 3, value, service.path, 'Service → CE ; pas de service fictif.');
    put(ais, 4, start, `${a.path}.start`, 'Début de l’activité du rendez-vous.');
    if (a.duration) {
      put(ais, 7, String(a.duration.minutes), a.duration.path, a.duration.source === 'explicit' ? 'Durée explicite prioritaire.' : 'Différence fiable fin − début, en minutes.');
      put(ais, 8, 'min^minute^UCUM', 'Unité du modèle normalisé', 'Minute UCUM pour une durée exprimée en minutes.');
    } else warnings.push('ABSENT · Durée fiable absente ; AIS-7/8 vides.');
  }
  if (!segments.some(s => s.name === 'AIS')) warnings.push('ABSENT · Aucun service représentable : segment AIS omis ; dates conservées dans SCH-11.');
  const resourceStart = (p: Participant): string => {
    if (!p.start) return start;
    try { return toHL7Instant(p.start); } catch { warnings.push(`ERR-MAP · Période de ${p.path} invalide ; segment facultatif omis.`); return ''; }
  };
  // SIU_S12 groups occur in the order AIS, AIL, AIP in v2.5.1.
  for (const p of eligible('Location')) {
    const ids = currentIdentifiers(p.identifiers); const ts = resourceStart(p);
    if (!ids.length || !ts) { warnings.push(`ABSENT · ${p.path} sans identifiant métier ou début fiable ; AIL omis.`); continue; }
    const ail = segment('AIL');
    put(ail, 1, String(segments.filter(s => s.name === 'AIL').length), 'Index de lieu', 'Numérotation.');
    const pl = ids.map(id => `${'^'.repeat(8)}${escapeHL7(p.display)}^${escapeHL7(id.value)}&${escapeHL7(id.system)}`).join('~');
    put(ail, 3, pl, `${p.path}.identifier + ${p.path}.name`, 'PL.9 description, PL.10 identifiant métier EI ; aucune chambre déduite du nom.');
    put(ail, 6, ts, p.start ? `${p.path} (participant.period.start)` : `${a.path}.start`, 'Période du participant prioritaire, sinon début du rendez-vous.');
  }
  for (const p of eligible('Practitioner')) {
    const id = currentIdentifiers(p.identifiers)[0]; const name = p.names.find(n => n.family || n.given.length); const ts = resourceStart(p);
    if ((!id && !name) || !ts) { warnings.push(`ABSENT · ${p.path} sans identité structurée ou début fiable ; AIP omis.`); continue; }
    const aip = segment('AIP');
    put(aip, 1, String(segments.filter(s => s.name === 'AIP').length), 'Index de professionnel', 'Numérotation.');
    put(aip, 3, components([id?.value, name?.family, name?.given[0], name?.given.slice(1).join(' '), name?.suffix.join(' '), name?.prefix.join(' '), '', '', id?.system]), `${p.path}.identifier + ${p.path}.name`, 'XCN ; identifiant métier uniquement, autorité en XCN.9.1.');
    put(aip, 6, ts, p.start ? `${p.path} (participant.period.start)` : `${a.path}.start`, 'Période du participant prioritaire, sinon début du rendez-vous.');
    if (!id) warnings.push(`ABSENT · ${p.path} sans identifiant métier ; seul le nom structuré est transmis en XCN.`);
    if (p.names.length > 1 || p.identifiers.length > 1) warnings.push(`PERTE · ${p.path} : premier nom structuré et premier identifiant non ancien retenus.`);
  }
  if (!segments.some(s => s.name === 'AIP')) warnings.push('ABSENT · Professionnel non renseigné ou non représentable ; AIP omis.');
  if (!segments.some(s => s.name === 'AIL')) warnings.push('ABSENT · Lieu non renseigné ou non représentable ; AIL omis.');
  const message = `${segments.map(serializeSegment).join('\r')}\r`;
  errors.push(...validateHL7(message));
  return finish(message);
}
