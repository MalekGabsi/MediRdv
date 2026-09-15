/** Focused runtime checks for the structures consumed by the prototype.
 * Missing clinical fields remain readable and are checked by normalization/mapping.
 * This does not replace validation of complete FHIR profiles and terminology bindings.
 */
export function checkResourceShape(value: unknown, depth = 0): void {
  const fail = () => { throw new Error('Structure FHIR incompatible.'); };
  const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
  if (!object(value) || typeof value.resourceType !== 'string' || depth > 8) return fail();
  const stringFields = (r: Record<string, unknown>, fields: string[]) => { for (const key of fields) if (r[key] !== undefined && typeof r[key] !== 'string') fail(); };
  const objectArray = (r: Record<string, unknown>, key: string): Record<string, unknown>[] => {
    if (r[key] === undefined) return [];
    if (!Array.isArray(r[key]) || !r[key].every(object)) return fail() as never;
    return r[key];
  };
  const stringArray = (r: Record<string, unknown>, key: string) => { if (r[key] !== undefined && (!Array.isArray(r[key]) || !r[key].every(v => typeof v === 'string'))) fail(); };
  const concept = (r: Record<string, unknown>) => { stringFields(r, ['text']); for (const c of objectArray(r, 'coding')) stringFields(c, ['system', 'code', 'display']); };
  stringFields(value, ['id', 'implicitRules']);
  if (value.meta !== undefined) { if (!object(value.meta)) return fail(); stringArray(value.meta, 'profile'); stringFields(value.meta, ['versionId', 'lastUpdated']); }
  if (value.resourceType === 'Bundle') {
    stringFields(value, ['type']);
    for (const entry of objectArray(value, 'entry')) { if (entry.resource) checkResourceShape(entry.resource, depth + 1); stringFields(entry, ['fullUrl']); if (entry.search !== undefined && !object(entry.search)) fail(); }
    for (const link of objectArray(value, 'link')) stringFields(link, ['relation', 'url']);
  }
  if (value.resourceType === 'CapabilityStatement') {
    stringFields(value, ['fhirVersion']);
    for (const rest of objectArray(value, 'rest')) for (const resource of objectArray(rest, 'resource')) { stringArray(resource, 'searchInclude'); for (const param of objectArray(resource, 'searchParam')) stringFields(param, ['name']); }
  }
  if (value.resourceType === 'OperationOutcome') for (const issue of objectArray(value, 'issue')) stringFields(issue, ['severity', 'code']);
  if (['Patient', 'Appointment', 'Practitioner', 'PractitionerRole', 'Location', 'HealthcareService', 'Organization'].includes(value.resourceType)) {
    for (const id of objectArray(value, 'identifier')) stringFields(id, ['value', 'system', 'use']);
    objectArray(value, 'extension'); objectArray(value, 'modifierExtension');
    for (const r of objectArray(value, 'contained')) checkResourceShape(r, depth + 1);
  }
  if (['Patient', 'Practitioner'].includes(value.resourceType)) {
    for (const name of objectArray(value, 'name')) { stringFields(name, ['family', 'text', 'use']); for (const key of ['given', 'prefix', 'suffix']) stringArray(name, key); }
    stringFields(value, ['birthDate', 'gender']);
  }
  if (['Location', 'HealthcareService', 'Organization'].includes(value.resourceType)) stringFields(value, ['name']);
  if (value.resourceType === 'Appointment') {
    stringFields(value, ['status', 'start', 'end', 'description']);
    if (value.minutesDuration !== undefined && typeof value.minutesDuration !== 'number') fail();
    for (const key of ['reasonCode', 'serviceType', 'serviceCategory', 'specialty']) for (const c of objectArray(value, key)) concept(c);
    if (value.appointmentType !== undefined) { if (!object(value.appointmentType)) return fail(); concept(value.appointmentType); }
    for (const p of objectArray(value, 'participant')) {
      stringFields(p, ['status']); objectArray(p, 'type');
      if (p.actor !== undefined) { if (!object(p.actor)) return fail(); stringFields(p.actor, ['reference', 'display', 'type']); }
      if (p.period !== undefined) { if (!object(p.period)) return fail(); stringFields(p.period, ['start', 'end']); }
    }
  }
  if (value.resourceType === 'HealthcareService') for (const c of objectArray(value, 'type')) concept(c);
  if (value.resourceType === 'PractitionerRole') {
    for (const key of ['practitioner', 'organization']) if (value[key] !== undefined) { if (!object(value[key])) return fail(); stringFields(value[key], ['reference', 'display', 'type']); }
    for (const key of ['location', 'healthcareService']) for (const r of objectArray(value, key)) stringFields(r, ['reference', 'display', 'type']);
  }
}
