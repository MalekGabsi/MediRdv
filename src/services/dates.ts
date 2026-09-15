const datePattern = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;
const instantPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
function validCalendar(year: number, month = 1, day = 1): boolean {
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
export function toHL7Date(value: string): string {
  const m = datePattern.exec(value);
  if (!m || !validCalendar(+m[1], m[2] ? +m[2] : 1, m[3] ? +m[3] : 1)) throw new Error('Date FHIR invalide.');
  return value.replaceAll('-', '');
}
export function toHL7Instant(value: string): string {
  const m = instantPattern.exec(value);
  if (!m || !validCalendar(+m[1], +m[2], +m[3]) || +m[4] > 23 || +m[5] > 59 || +m[6] > 59) throw new Error('Instant FHIR invalide ou non pris en charge.');
  const zone = m[8];
  if (zone !== 'Z' && (+zone.slice(1, 3) > 14 || +zone.slice(4) > 59 || (+zone.slice(1, 3) === 14 && +zone.slice(4) !== 0))) throw new Error('Fuseau invalide.');
  if (m[7] && m[7].length > 5) throw new Error('Précision supérieure aux quatre décimales HL7 : conversion sans perte impossible.');
  return `${m.slice(1, 7).join('')}${m[7] ?? ''}${zone === 'Z' ? '+0000' : zone.replace(':', '')}`;
}
export function isValidInstant(value: string): boolean {
  try { toHL7Instant(value); return Number.isFinite(Date.parse(value)); } catch { return false; }
}
export function instantTicks(value: string): bigint {
  toHL7Instant(value);
  const fraction = /\.(\d+)(?=Z|[+-]\d{2}:\d{2}$)/.exec(value)?.[1] ?? '';
  const wholeSeconds = value.replace(/\.\d+(?=Z|[+-]\d{2}:\d{2}$)/, '');
  return BigInt(Date.parse(wholeSeconds)) * 10n + BigInt(fraction.padEnd(4, '0'));
}
export function displayDate(value?: string): string {
  if (!value) return 'Non renseigné';
  if (!value.includes('T')) { try { toHL7Date(value); return value.split('-').reverse().join('/'); } catch { return value; } }
  if (!isValidInstant(value)) return `${value} (à vérifier)`;
  const [date, time] = value.split('T');
  const zone = time.endsWith('Z') ? 'UTC' : `UTC${time.slice(-6)}`;
  return `${date.split('-').reverse().join('/')} · ${time.slice(0, 5)} ${zone}`;
}
