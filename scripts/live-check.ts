/** Read-only integration test; discovers live data without seeding or embedding it. */
import assert from 'node:assert/strict';
import type { Appointment, Patient } from 'fhir/r4';
import { FhirApi, type SearchPage } from '../src/services/fhirApi';
import { normalize } from '../src/services/normalizer';
import { resolveParticipants, referenceKey } from '../src/services/references';
import { mapToHL7 } from '../src/services/hl7Mapper';
import { validateHL7 } from '../src/services/hl7Validator';

const api = new FhirApi(process.env.FHIR_BASE_URL || 'https://hapi.fhir.org/baseR4', trace => console.log(`${trace.operation}: ${trace.status} (${trace.durationMs} ms)`), 30000);
const cap = await api.capabilities(); assert.equal(cap.fhirVersion, '4.0.1');
let next: string | undefined = 'Appointment?status=booked&_count=20&_include=Appointment:actor';
let success = false;
for (let pageIndex = 0; next && pageIndex < 5 && !success; pageIndex++) {
  const page: SearchPage<Appointment> = await api.page<Appointment>(next, 'Appointment'); next = page.next;
  for (const appointment of page.resources) {
    if (!appointment.identifier?.some(id => id.value)) continue;
    const ref = appointment.participant.find(p => p.actor?.reference && referenceKey(p.actor.reference, api.base)?.startsWith('Patient/'))?.actor?.reference;
    if (!ref) continue;
    const source = await api.read(ref); if (source.resource.resourceType !== 'Patient') continue;
    const patient: Patient = source.resource; if (!patient.identifier?.some(id => id.value)) continue;
    const appointments = await api.appointments(patient.id!, cap.actorInclude); assert(appointments.resources.length > 0);
    const all = [source, ...page.sources, ...appointments.sources];
    const resolution = await resolveParticipants(api, appointment, all);
    const normalized = normalize(patient, appointment, [...all, ...resolution.sources], api.base, resolution.warnings);
    const result = mapToHL7(normalized, { trigger: 'S12', confirmed: true });
    if (result.status === 'FAILED') { console.log(`Candidate rejected: ${result.errors.map(error => error.split(' · ')[0]).join(', ')}`); continue; }
    assert(result.hl7Message.startsWith('MSH|')); assert.deepEqual(validateHL7(result.hl7Message), []);
    const family = patient.name?.find(name => name.family)?.family;
    if (family) { const matches = await api.searchPatients(family, 'name'); assert(matches.resources.length > 0); }
    console.log(JSON.stringify({ outcome: result.status, fhirVersion: cap.fhirVersion, hl7Version: result.audit.hl7Version, mappingVersion: result.audit.mappingVersion, appointmentCountLoaded: appointments.resources.length, segmentCount: result.hl7Message.split('\r').filter(Boolean).length, warningCount: result.warnings.length, fieldTraceCount: result.fields.length, alignmentCount: result.alignments.length, timestamp: result.audit.timestamp }, null, 2));
    success = true; break;
  }
}
assert(success, 'No currently available HAPI data met the local mapping profile within 5 pages. No data were invented or written.');
