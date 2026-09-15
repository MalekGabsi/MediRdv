export const MAPPING_VERSION = 'medirdv-siu-1.0.0';
export const GENDER_SYSTEM = 'http://hl7.org/fhir/administrative-gender';
export const STATUS_SYSTEM = 'http://hl7.org/fhir/appointmentstatus';
export const GENDER_MAP: Record<string, string> = { male: 'M', female: 'F', other: 'O', unknown: 'U' };
// Conservative, explicit local alignment with the suggested values of table 0278.
// arrived/checked-in do not imply Started; noshow does not imply Cancelled.
export const STATUS_MAP: Record<string, string> = { pending: 'Pending', booked: 'Booked', fulfilled: 'Complete', cancelled: 'Cancelled', waitlist: 'Waitlist' };
export const STATUS_LABELS: Record<string, string> = { proposed: 'Proposé', pending: 'En attente', booked: 'Confirmé', arrived: 'Arrivé', fulfilled: 'Terminé', cancelled: 'Annulé', noshow: 'Non présenté', 'entered-in-error': 'Saisi par erreur', 'checked-in': 'Enregistré', waitlist: 'Liste d’attente' };
