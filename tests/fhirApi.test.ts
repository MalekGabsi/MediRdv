import { afterEach, describe, expect, it, vi } from 'vitest';
import { FhirApi } from '../src/services/fhirApi';
import { makeResourceIndex, lookupReference, resolveParticipants } from '../src/services/references';
import { normalize } from '../src/services/normalizer';
import { appointment, BASE, capability, patient, source, sources, practitioner } from './fixtures';
import type { PractitionerRole } from 'fhir/r4';

const response = (resource: unknown, status = 200, type = 'application/fhir+json') => new Response(JSON.stringify(resource), { status, headers: { 'content-type': type } });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('FHIR transport and capability checks', () => {
  it('checks R4 version and Appointment patient search capability', async () => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(capability))); const cap = await new FhirApi().capabilities(); expect(cap.fhirVersion).toBe('4.0.1'); expect(cap.appointmentPatient).toBe(true); expect(cap.actorInclude).toBe(true); });
  it('rejects the wrong FHIR version', async () => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ...capability, fhirVersion: '5.0.0' }))); await expect(new FhirApi().capabilities()).rejects.toThrow('Version FHIR incompatible'); });
  it('rejects undeclared appointment search capability', async () => { const cap = structuredClone(capability); cap.rest![0].resource![1].searchParam = []; vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(cap))); await expect(new FhirApi().capabilities()).rejects.toThrow('Appointment?patient'); });
  it('distinguishes zero matches from server failure', async () => { const fetcher = vi.fn().mockResolvedValueOnce(response({ resourceType: 'Bundle', type: 'searchset', total: 0 })).mockResolvedValueOnce(response({}, 500)); vi.stubGlobal('fetch', fetcher); expect((await new FhirApi().searchPatients('absent', 'name')).resources).toEqual([]); await expect(new FhirApi().searchPatients('absent', 'name')).rejects.toThrow('HTTP 500'); });
  it('treats a patient read 404 as no match', async () => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({}, 404))); expect((await new FhirApi().searchPatients('absent', 'id')).total).toBe(0); });
  it('encodes queries and never logs patient identity or search criteria', async () => { const fetcher = vi.fn().mockResolvedValue(response({ resourceType: 'Bundle', type: 'searchset' })); vi.stubGlobal('fetch', fetcher); const trace = vi.fn(); await new FhirApi(BASE, trace).searchPatients('Name&secret=1', 'name'); expect(fetcher.mock.calls[0][0]).toContain('name=Name%26secret%3D1'); expect(JSON.stringify(trace.mock.calls)).not.toContain('Name'); expect(trace.mock.calls[0][0].operation).toBe('GET Patient'); });
  it('follows next URLs and does not confuse included resources with matches', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ resourceType: 'Bundle', type: 'searchset', entry: [{ resource: patient, search: { mode: 'match' } }, { resource: { ...patient, id: 'included' }, search: { mode: 'include' } }], link: [{ relation: 'next', url: `${BASE}/?_getpages=test-page&_page=2` }] })).mockResolvedValueOnce(response({ resourceType: 'Bundle', type: 'searchset', entry: [{ resource: { ...patient, id: 'next' } }] }));
    vi.stubGlobal('fetch', fetcher); const api = new FhirApi(); const first = await api.searchPatients('test', 'name'); expect(first.resources).toHaveLength(1); expect(first.sources).toHaveLength(2); expect((await api.page(first.next!, 'Patient')).resources[0].id).toBe('next');
  });
  it('blocks malicious cross-server pagination and references', () => { const api = new FhirApi(); expect(() => api.safeUrl('https://evil.example/Patient/1')).toThrow('externe'); expect(() => api.safeUrl('../baseR5/Patient/1')).toThrow('externe'); expect(api.safeUrl('http://hapi.fhir.org/baseR4/Patient/1')).toBe(`${BASE}/Patient/1`); });
  it('accepts HAPI next links at the base endpoint without a trailing slash', () => { expect(new FhirApi().safeUrl(`${BASE}?_getpages=cursor`)).toBe(`${BASE}?_getpages=cursor`); });
  it('handles OperationOutcome in direct and Bundle responses', async () => { const oo = { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid' }] }; const fetcher = vi.fn().mockResolvedValueOnce(response(oo)).mockResolvedValueOnce(response({ resourceType: 'Bundle', type: 'searchset', entry: [{ resource: oo }] })); vi.stubGlobal('fetch', fetcher); await expect(new FhirApi().read('Patient/1')).rejects.toThrow('OperationOutcome'); await expect(new FhirApi().searchPatients('test', 'name')).rejects.toThrow('OperationOutcome'); });
  it('rejects non-JSON and malformed resource shapes', async () => { const fetcher = vi.fn().mockResolvedValueOnce(response({}, 200, 'text/html')).mockResolvedValueOnce(response({ resourceType: 'Appointment', participant: 'invalid' })); vi.stubGlobal('fetch', fetcher); await expect(new FhirApi().read('Patient/1')).rejects.toThrow('JSON FHIR'); await expect(new FhirApi().read('Appointment/1')).rejects.toThrow('structure'); });
  it('turns a network failure into a readable error', async () => { vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed'))); await expect(new FhirApi().read('metadata')).rejects.toThrow('Connexion au serveur FHIR impossible'); });
  it('aborts timed out calls and reports a timeout', async () => {
    vi.useFakeTimers(); vi.stubGlobal('fetch', vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => init.signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))));
    const pending = new FhirApi(BASE, undefined, 50).read('metadata'); const expectation = expect(pending).rejects.toThrow('trop de temps'); await vi.advanceTimersByTimeAsync(51); await expectation;
  });
});
describe('participant resolution', () => {
  it('resolves missing actors with read calls and tolerates an optional 404', async () => { vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(practitioner)).mockResolvedValueOnce(response({}, 404))); const resolved = await resolveParticipants(new FhirApi(), appointment, [source(patient)], undefined); expect(resolved.sources).toHaveLength(1); expect(resolved.warnings.join(' ')).toContain('ERR-REF'); });
  it('uses included resources without redundant calls', async () => { const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher); const resolved = await resolveParticipants(new FhirApi(), appointment, sources); expect(resolved.sources).toEqual([]); expect(fetcher).not.toHaveBeenCalled(); });
  it('resolves PractitionerRole but does not infer appointment locations from the role', async () => {
    const role: PractitionerRole = { resourceType: 'PractitionerRole', id: 'role', practitioner: { reference: 'Practitioner/test-practitioner' }, location: [{ reference: 'Location/test-location' }] };
    const a = structuredClone(appointment); a.participant = [a.participant[0], { actor: { reference: 'PractitionerRole/role' }, status: 'accepted' }];
    const records = [...sources, source(role)]; const normalized = normalize(patient, a, records, BASE);
    expect(normalized.appointment.participants.some(p => p.kind === 'Practitioner')).toBe(true); expect(normalized.appointment.participants.some(p => p.kind === 'Location')).toBe(false);
  });
  it('resolves contained resources only inside their owning resource', () => { const a = structuredClone(appointment); a.contained = [{ ...practitioner, id: 'contained-practitioner' }]; const index = makeResourceIndex(sources, BASE); expect(lookupReference({ reference: '#contained-practitioner' }, a, index, BASE)?.resourceType).toBe('Practitioner'); expect(lookupReference({ reference: '#contained-practitioner' }, patient, index, BASE)).toBeUndefined(); });
  it('does not resolve a historic reference with the current version', () => { const index = makeResourceIndex(sources, BASE); expect(lookupReference({ reference: 'Practitioner/test-practitioner/_history/99' }, appointment, index, BASE)).toBeUndefined(); });
});
