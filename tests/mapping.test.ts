import { describe, expect, it } from 'vitest';
import { normalize } from '../src/services/normalizer';
import { toHL7Date, toHL7Instant } from '../src/services/dates';
import { escapeHL7, mapToHL7 } from '../src/services/hl7Mapper';
import { validateHL7 } from '../src/services/hl7Validator';
import { appointment, BASE, patient, sources } from './fixtures';

const event = { trigger: 'S12' as const, confirmed: true };
const convert = (p = structuredClone(patient), a = structuredClone(appointment)) => mapToHL7(normalize(p, a, sources, BASE), event, { now: new Date('2026-09-15T12:00:00Z'), correlationId: 'test-control-id' });
const field = (message: string, segment: string, n: number) => message.split('\r').find(line => line.startsWith(`${segment}|`))?.split('|')[segment === 'MSH' ? n - 1 : n];
describe('dates and HL7 syntax', () => {
  it('preserves source timezone and fractional precision', () => { expect(toHL7Instant('2026-09-18T10:00:00.1234+02:00')).toBe('20260918100000.1234+0200'); expect(toHL7Instant('2026-09-18T08:00:00Z')).toBe('20260918080000+0000'); });
  it.each(['1990', '1990-04', '1990-04-18'])('does not add missing date precision: %s', value => expect(toHL7Date(value)).toBe(value.replaceAll('-', '')));
  it.each(['2025-02-29T10:00:00Z', '2026-09-18T25:00:00Z', '2026-09-18T10:00:00', '2026-09-18T10:00:00+15:00', '2026-09-18T10:00:00.12345Z'])('rejects invalid or unsupported instant %s', value => expect(() => toHL7Instant(value)).toThrow());
  it('rejects invalid leap day but accepts leap years', () => { expect(() => toHL7Date('2025-02-29')).toThrow(); expect(toHL7Date('2024-02-29')).toBe('20240229'); });
  it('escapes delimiters and segment injection exactly once', () => expect(escapeHL7('A|B^C~D\\E&F\r\n')).toBe('A\\F\\B\\S\\C\\R\\D\\E\\E\\T\\F\\X0D\\\\X0A\\'));
});
describe('local SIU mapping', () => {
  it('maps a complete appointment with standard segment order and field positions', () => {
    const r = convert(); expect(r.status).toBe('SUCCESS_WITH_WARNINGS'); expect(r.errors).toEqual([]);
    expect(r.hl7Message.split('\r').filter(Boolean).map(s => s.slice(0, 3))).toEqual(['MSH', 'SCH', 'PID', 'RGS', 'AIS', 'AIL', 'AIP']);
    expect(field(r.hl7Message, 'MSH', 9)).toBe('SIU^S12^SIU_S12'); expect(field(r.hl7Message, 'MSH', 18)).toBe('UNICODE UTF-8');
    expect(field(r.hl7Message, 'SCH', 2)).toBe('TEST-A-1^urn:test:appointments'); expect(field(r.hl7Message, 'PID', 3)).toBe('TEST-P-1^^^urn:test:patients');
    expect(field(r.hl7Message, 'PID', 7)).toBe('199004'); expect(field(r.hl7Message, 'PID', 8)).toBe('F');
    expect(field(r.hl7Message, 'AIS', 4)).toBe('20260918100000+0200'); expect(field(r.hl7Message, 'AIS', 7)).toBe('30');
    expect(field(r.hl7Message, 'AIL', 3)?.split('^')[9]).toBe('ROOM-1&urn:test:locations');
    expect(validateHL7(r.hl7Message)).toEqual([]);
  });
  it('fails rather than using FHIR ids as business identifiers', () => {
    const p = structuredClone(patient); p.identifier = []; const a = structuredClone(appointment); a.identifier = [];
    const r = convert(p, a); expect(r.status).toBe('FAILED'); expect(r.hl7Message).toBe(''); expect(r.errors.join(' ')).toContain('PID-3'); expect(r.errors.join(' ')).toContain('SCH-2');
  });
  it('does not deduce an event from booked', () => { const r = mapToHL7(normalize(patient, appointment, sources, BASE), { trigger: 'S12', confirmed: false }); expect(r.status).toBe('FAILED'); expect(r.hl7Message).toBe(''); });
  it('rejects an incompatible state for the local new booking scenario', () => { const a = structuredClone(appointment); a.status = 'cancelled'; expect(convert(patient, a).status).toBe('FAILED'); });
  it('refuses wrong-patient linkage even for matching ids at a different server', () => { const a = structuredClone(appointment); a.participant[0].actor!.reference = 'https://other.example/fhir/Patient/test-patient'; expect(convert(patient, a).status).toBe('FAILED'); });
  it('rejects missing end and dates in reverse order', () => { const a = structuredClone(appointment); a.end = undefined; expect(convert(patient, a).status).toBe('FAILED'); a.end = '2026-09-18T09:59:00+02:00'; expect(convert(patient, a).status).toBe('FAILED'); });
  it('allows missing optional professional, service, location, gender and birthDate', () => { const a = structuredClone(appointment); a.participant = [a.participant[0]]; a.serviceType = undefined; const p = structuredClone(patient); p.gender = undefined; p.birthDate = undefined; const r = convert(p, a); expect(r.status).toBe('SUCCESS_WITH_WARNINGS'); expect(r.hl7Message).not.toMatch(/\rAI[SPL]\|/); expect(field(r.hl7Message, 'SCH', 11)).toContain('20260918100000+0200'); expect(field(r.hl7Message, 'PID', 8)).toBeUndefined(); });
  it('reports unresolved optional references without inventing a clinician', () => { const r = mapToHL7(normalize(patient, appointment, sources.filter(s => s.resource.resourceType !== 'Practitioner'), BASE), event); expect(r.status).toBe('SUCCESS_WITH_WARNINGS'); expect(r.hl7Message).not.toContain('\rAIP|'); expect(r.warnings.join(' ')).toContain('ERR-REF'); });
  it('preserves local service codes with their system', () => { const r = convert(); expect(field(r.hl7Message, 'AIS', 3)).toBe('LOCAL-CONSULT^Consultation de test^urn:test:services'); expect(r.alignments.some(a => a.targetCode === 'LOCAL-CONSULT' && a.sourceCode === a.targetCode)).toBe(true); });
  it('does not upgrade display-only concepts to coded concepts', () => { const a = structuredClone(appointment); a.serviceType = [{ coding: [{ display: 'Texte sans code' }] }]; const r = convert(patient, a); expect(field(r.hl7Message, 'AIS', 3)).toBe('^Texte sans code'); expect(r.warnings.join(' ')).toContain('sans couple system + code'); });
  it('preserves explicit minutesDuration when different from elapsed time', () => { const a = structuredClone(appointment); a.minutesDuration = 20; const r = convert(patient, a); expect(field(r.hl7Message, 'AIS', 7)).toBe('20'); expect(r.warnings.join(' ')).toContain('diffère de la plage'); });
  it('compares sub-millisecond instants without rounding them to milliseconds', () => { const a = structuredClone(appointment); a.start = '2026-09-18T10:00:00.0002Z'; a.end = '2026-09-18T10:00:00.0001Z'; expect(convert(patient, a).status).toBe('FAILED'); });
  it('never exports unknown modifierExtensions as success', () => { const a = structuredClone(appointment); a.modifierExtension = [{ url: 'urn:test:modifier', valueBoolean: true }]; const r = convert(patient, a); expect(r.status).toBe('FAILED'); expect(r.hl7Message).toBe(''); });
  it('protects HL7 from malicious clinical separators', () => { const p = structuredClone(patient); p.name![0].family = 'Test|Injected\rPID|evil'; const r = convert(p); expect(r.hl7Message.split('\r').filter(l => l.startsWith('PID|'))).toHaveLength(1); expect(r.hl7Message).toContain('Test\\F\\Injected\\X0D\\PID\\F\\evil'); });
  it('traces every nonempty field to a source or declared rule', () => { const r = convert(); for (const line of r.hl7Message.split('\r').filter(Boolean)) { const name = line.slice(0, 3); const fs = line.split('|'); fs.slice(1).forEach((v, i) => { if (!v) return; const n = name === 'MSH' ? i + 2 : i + 1; expect(r.fields.some(f => f.target === `${name}${['AIS', 'AIL', 'AIP'].includes(name) ? '[1]' : ''}-${n}` && !!f.source && !!f.rule)).toBe(true); }); } });
  it('excludes names and clinical data from the exportable audit', () => { const r = convert(); const audit = JSON.stringify(r.audit); expect(audit).not.toContain(patient.name![0].family); expect(audit).not.toContain(patient.birthDate); expect(audit).not.toContain('Consultation de test'); });
});
