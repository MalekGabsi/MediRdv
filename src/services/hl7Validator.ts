export interface Segment { name: string; fields: Record<number, string> }
export function serializeSegment(segment: Segment): string {
  const max = Math.max(0, ...Object.keys(segment.fields).map(Number));
  if (segment.name === 'MSH') return `MSH|${Array.from({ length: max - 1 }, (_, index) => segment.fields[index + 2] ?? '').join('|')}`;
  return [segment.name, ...Array.from({ length: max }, (_, index) => segment.fields[index + 1] ?? '')].join('|');
}
/** Validates the documented pedagogical subset; not a full HL7 conformance validator. */
export function validateHL7(message: string): string[] {
  const errors: string[] = [];
  if (!message.endsWith('\r') || message.includes('\n')) errors.push('ERR-HL7 · Les segments doivent être terminés par CR.');
  const lines = message.split('\r').filter(Boolean);
  const names = lines.map(line => line.split('|')[0]);
  if (names.slice(0, 4).join(',') !== 'MSH,SCH,PID,RGS') errors.push('ERR-HL7 · Séquence MSH, SCH, PID, RGS requise.');
  if (!/^MSH,SCH,PID,RGS(,AIS)*(,AIL)*(,AIP)*$/.test(names.join(','))) errors.push('ERR-HL7 · Ordre des groupes invalide.');
  const required: Record<string, number[]> = { MSH: [2, 7, 9, 10, 11, 12, 18], SCH: [2, 6, 11], PID: [3, 5], RGS: [1], AIS: [1, 3, 4], AIL: [1, 3, 6], AIP: [1, 3, 6] };
  for (const line of lines) {
    const fields = line.split('|'); const name = fields[0];
    const get = (n: number) => fields[name === 'MSH' ? n - 1 : n];
    for (const n of required[name] ?? []) if (!get(n)) errors.push(`ERR-HL7 · ${name}-${n} requis par le profil local.`);
    if (name === 'MSH' && (get(2) !== '^~\\&' || get(9) !== 'SIU^S12^SIU_S12' || get(11) !== 'P' || get(12) !== '2.5.1' || get(18) !== 'UNICODE UTF-8')) errors.push('ERR-HL7 · En-tête incompatible avec le profil.');
    if (name === 'PID' && !get(3)?.split('~').every(value => value.split('^')[0])) errors.push('ERR-HL7 · Identifiant patient vide.');
    if (name === 'SCH' && !get(2)?.split('^')[0]) errors.push('ERR-HL7 · Identifiant métier de rendez-vous vide.');
    const limits: Record<string, Record<number, number>> = { SCH: { 2: 75, 6: 250, 7: 250, 8: 250, 11: 200, 25: 250 }, PID: { 3: 250, 5: 250, 7: 26, 8: 1 }, AIS: { 3: 250, 4: 26 }, AIP: { 3: 250, 6: 26 }, AIL: { 3: 80, 6: 26 } };
    for (const [n, max] of Object.entries(limits[name] ?? {})) if ((get(+n) ?? '').split('~').some(value => value.length > max)) errors.push(`ERR-HL7 · ${name}-${n} dépasse ${max} caractères ; aucune troncature silencieuse.`);
  }
  return errors;
}
