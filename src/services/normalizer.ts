import type { Appointment, CodeableConcept, FhirResource, HumanName as FhirName, Identifier as FhirIdentifier, Patient, Reference } from 'fhir/r4';
import type { Concept, HumanName, Identifier, NormalizedContext, NormalizedPatient, Participant } from '../models/normalizedModel';
import type { SourceResource } from './fhirApi';
import { instantTicks, isValidInstant } from './dates';
import { lookupReference, makeResourceIndex, referenceKey } from './references';

const text = (value: unknown): string | undefined => typeof value === 'string' && value.trim() ? value : undefined;
const list = <T,>(value: T[] | undefined): T[] => Array.isArray(value) ? value : [];
const strings = (value: string[] | undefined) => list(value).filter(v => typeof v === 'string');
export function identifiers(values: FhirIdentifier[] | undefined, path: string): Identifier[] {
  return list(values).flatMap((v, i) => v && text(v.value) ? [{ value: v.value!, system: text(v.system), use: text(v.use), path: `${path}[${i}]` }] : []);
}
function names(values: FhirName[] | undefined, path: string): HumanName[] {
  return list(values).filter(Boolean).map((v, i) => ({ family: text(v.family), given: strings(v.given), prefix: strings(v.prefix), suffix: strings(v.suffix), text: text(v.text), path: `${path}[${i}]` }));
}
export function nameDisplay(name?: HumanName): string {
  return name?.text || [...(name?.prefix ?? []), ...(name?.given ?? []), name?.family, ...(name?.suffix ?? [])].filter(Boolean).join(' ') || 'Non renseigné';
}
export function conceptLabel(concept?: Concept): string {
  return concept?.text || concept?.coding.find(c => c.display)?.display || concept?.coding.find(c => c.code)?.code || 'Non renseigné';
}
function concepts(values: CodeableConcept[] | undefined, path: string): Concept[] {
  return list(values).filter(Boolean).map((c, i) => ({ text: text(c.text), coding: list(c.coding).filter(Boolean).map(v => ({ system: text(v.system), code: text(v.code), display: text(v.display) })), path: `${path}[${i}]` }));
}
export function normalizePatient(patient: Patient): NormalizedPatient {
  const path = `Patient/${patient.id ?? '(sans id)'}`;
  const ns = names(patient.name, `${path}.name`);
  return { id: text(patient.id), identifiers: identifiers(patient.identifier, `${path}.identifier`), names: ns, display: nameDisplay(ns[0]), birthDate: text(patient.birthDate), gender: text(patient.gender), path };
}

export function normalize(patient: Patient, appointment: Appointment, sources: SourceResource[], base: string, resolutionWarnings: string[] = []): NormalizedContext {
  const p = normalizePatient(patient); const path = `Appointment/${appointment.id ?? '(sans id)'}`;
  const warnings = [...resolutionWarnings]; const errors: string[] = [];
  const index = makeResourceIndex(sources, base);
  const participants: Participant[] = []; const organizations: NormalizedContext['appointment']['organizations'] = [];
  let patientLinked = false;
  const participantList = list(appointment.participant);
  if (!participantList.length) errors.push('ERR-DATA · Aucun participant dans le rendez-vous.');
  const addParticipant = (ref: Reference | undefined, owner: FhirResource, sourcePath: string, status?: string, period?: { start?: string; end?: string }, depth = 0) => {
    if (depth > 2) { errors.push('ERR-REF · Chaîne de rôles cyclique ou incompatible avec PractitionerRole.practitioner.'); return; }
    const resource = lookupReference(ref, owner, index, base);
    const kind = resource?.resourceType ?? (ref?.reference ? referenceKey(ref.reference, base)?.split('/')[0] : undefined) ?? ref?.type?.split('/').pop() ?? 'Inconnu';
    if (kind === 'Patient') {
      const key = ref?.reference ? referenceKey(ref.reference, base)?.split('/').slice(0, 2).join('/') : undefined;
      if ((key && key === `Patient/${p.id}`) || (resource?.resourceType === 'Patient' && resource.id === p.id && p.id)) patientLinked = true;
      else warnings.push('ERR-DATA · Un autre patient participe au rendez-vous ; seul le patient sélectionné est exporté.');
    }
    const rpath = resource ? `${resource.resourceType}/${resource.id ?? ref?.reference ?? '(contenu)'}` : sourcePath;
    const rawNames = resource && 'name' in resource && Array.isArray(resource.name) ? resource.name as FhirName[] : undefined;
    const ns = names(rawNames, `${rpath}.name`);
    const display = resource && 'name' in resource && typeof resource.name === 'string' ? resource.name : ns.length ? nameDisplay(ns[0]) : ref?.display;
    const item: Participant = { kind, reference: ref?.reference, display, status, resolved: !!resource, identifiers: identifiers(resource && 'identifier' in resource && Array.isArray(resource.identifier) ? resource.identifier : undefined, `${rpath}.identifier`), names: ns, concepts: resource?.resourceType === 'HealthcareService' ? concepts(resource.type, `${rpath}.type`) : [], path: rpath, start: period?.start, end: period?.end };
    participants.push(item);
    if (resource?.resourceType === 'PractitionerRole') {
      warnings.push('PERTE · PractitionerRole : organisation, spécialité et rôle conservés dans la vue FHIR, sans équivalent complet dans AIP.');
      if (resource.practitioner) addParticipant(resource.practitioner, resource, `${rpath}.practitioner`, status, period, depth + 1);
      // Role locations/services describe capabilities, not necessarily the site/activity of this appointment.
      const org = lookupReference(resource.organization, resource, index, base);
      if (org?.resourceType === 'Organization') organizations.push({ reference: `Organization/${org.id}`, name: org.name, path: `${rpath}.organization` });
    }
    if (!resource && !['Patient', 'RelatedPerson', 'Device'].includes(kind)) warnings.push(`ERR-REF · ${ref?.reference ?? sourcePath} : référence facultative non résolue.`);
    if (!['Patient', 'Practitioner', 'PractitionerRole', 'Location', 'HealthcareService'].includes(kind)) warnings.push(`PERTE · Participant ${kind} omis du message cible.`);
    if (resource && 'modifierExtension' in resource && resource.modifierExtension?.length) errors.push(`ERR-DATA · ${rpath} contient une modifierExtension non interprétée.`);
    if (resource?.implicitRules) errors.push(`ERR-DATA · ${rpath} contient des règles implicites non interprétées.`);
    if (resource && 'extension' in resource && resource.extension?.length) warnings.push(`PERTE · Extensions de ${rpath} non transposées.`);
  };
  participantList.forEach((v, i) => {
    if (!v || typeof v !== 'object') { errors.push('ERR-DATA · Participant mal formé.'); return; }
    if (!['accepted', 'declined', 'tentative', 'needs-action'].includes(v.status)) errors.push(`ERR-TERM · participant[${i}].status absent ou invalide.`);
    if (!v.actor && !v.type?.length) errors.push(`ERR-DATA · participant[${i}] sans acteur ni rôle.`);
    addParticipant(v.actor, appointment, `${path}.participant[${i}].actor`, v.status, v.period);
  });
  if (!patientLinked) errors.push('ERR-DATA · Le rendez-vous ne peut pas être rattaché au patient sélectionné.');
  const status = text(appointment.status);
  if (!status || !['proposed', 'pending', 'booked', 'arrived', 'fulfilled', 'cancelled', 'noshow', 'entered-in-error', 'checked-in', 'waitlist'].includes(status)) errors.push('ERR-TERM · Statut Appointment absent ou invalide.');
  const start = text(appointment.start); const end = text(appointment.end);
  if (!!start !== !!end) errors.push('ERR-DATA · Invariant app-2 : début et fin doivent être présents ensemble.');
  if (!start && !['proposed', 'cancelled', 'waitlist'].includes(status ?? '')) errors.push('ERR-DATA · Invariant app-3 : ce statut exige des dates de début et de fin.');
  if (appointment.cancelationReason && !['cancelled', 'noshow'].includes(status ?? '')) errors.push('ERR-DATA · Invariant app-4 : motif d’annulation incompatible avec le statut.');
  if (start && !isValidInstant(start)) errors.push('ERR-DATA · Date de début invalide ou précision non prise en charge.');
  if (end && !isValidInstant(end)) errors.push('ERR-DATA · Date de fin invalide ou précision non prise en charge.');
  let duration: NormalizedContext['appointment']['duration'];
  const elapsed = start && end && isValidInstant(start) && isValidInstant(end) ? Number(instantTicks(end) - instantTicks(start)) / 600000 : undefined;
  if (elapsed !== undefined && elapsed < 0) errors.push('ERR-DATA · La fin précède le début du rendez-vous.');
  if (appointment.minutesDuration !== undefined) {
    if (!Number.isInteger(appointment.minutesDuration) || appointment.minutesDuration <= 0) errors.push('ERR-DATA · minutesDuration doit être un entier strictement positif.');
    else duration = { minutes: appointment.minutesDuration, source: 'explicit', path: `${path}.minutesDuration` };
    if (elapsed !== undefined && elapsed !== appointment.minutesDuration) warnings.push('DURÉE · minutesDuration diffère de la plage horaire ; la durée explicite est conservée.');
  } else if (elapsed !== undefined && elapsed >= 0) duration = { minutes: elapsed, source: 'calculated', path: `${path}.end − ${path}.start` };
  for (const r of [patient, appointment]) {
    if (r.modifierExtension?.length) errors.push(`ERR-DATA · ${r.resourceType} contient une modifierExtension non interprétée ; conversion bloquée.`);
    if (r.extension?.length) warnings.push(`PERTE · Extensions de ${r.resourceType} non transposées.`);
    if (r.meta?.profile?.length) warnings.push(`PROFIL · ${r.resourceType}.meta.profile visible dans les sources ; profils déclarés non validés par le prototype.`);
    if (r.implicitRules) errors.push(`ERR-DATA · Règles implicites de ${r.resourceType} non interprétées.`);
  }
  if (appointment.description || appointment.serviceCategory?.length || appointment.specialty?.length || appointment.reasonReference?.length || appointment.comment || appointment.patientInstruction) warnings.push('PERTE · Description, catégorie, spécialité, motifs référencés et instructions éventuels restent dans les sources ; aucun NTE n’est généré.');
  return { patient: p, appointment: { id: text(appointment.id), identifiers: identifiers(appointment.identifier, `${path}.identifier`), status, description: text(appointment.description), start, end, duration, reasons: concepts(appointment.reasonCode, `${path}.reasonCode`), services: concepts(appointment.serviceType, `${path}.serviceType`), categories: concepts(appointment.serviceCategory, `${path}.serviceCategory`), specialties: concepts(appointment.specialty, `${path}.specialty`), type: appointment.appointmentType ? { ...concepts([appointment.appointmentType], `${path}.appointmentType`)[0], path: `${path}.appointmentType` } : undefined, participants, organizations, patientLinked, path, warnings: [...new Set(warnings)], errors: [...new Set(errors)] } };
}
