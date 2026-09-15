export interface Identifier { value: string; system?: string; use?: string; path: string }
export interface HumanName { family?: string; given: string[]; prefix: string[]; suffix: string[]; text?: string; path: string }
export interface Coding { system?: string; code?: string; display?: string }
export interface Concept { text?: string; coding: Coding[]; path: string }
export interface NormalizedPatient {
  id?: string; identifiers: Identifier[]; names: HumanName[]; display: string;
  birthDate?: string; gender?: string; path: string;
}
export interface Participant {
  kind: string; reference?: string; display?: string; status?: string; resolved: boolean;
  identifiers: Identifier[]; names: HumanName[]; concepts: Concept[]; path: string;
  start?: string; end?: string;
}
export interface Organization { reference: string; name?: string; path: string }
export interface NormalizedAppointment {
  id?: string; identifiers: Identifier[]; status?: string; description?: string;
  start?: string; end?: string; duration?: { minutes: number; source: 'explicit' | 'calculated'; path: string };
  reasons: Concept[]; services: Concept[]; categories: Concept[]; specialties: Concept[]; type?: Concept;
  participants: Participant[]; organizations: Organization[]; patientLinked: boolean;
  path: string; warnings: string[]; errors: string[];
}
export interface NormalizedContext { patient: NormalizedPatient; appointment: NormalizedAppointment }
export interface FieldTrace { target: string; source: string; rule: string; value: string }
export interface TerminologyAlignment { sourceSystem: string; sourceCode: string; targetSystem: string; targetCode: string; target: string; rule: string }
export interface Audit {
  correlationId: string; appointmentId?: string; patientId?: string;
  fhirVersion: string; hl7Version: string; mappingVersion: string;
  timestamp: string; messageType: string; eventContext: string;
  status: TransformationResult['status']; warnings: string[]; errors: string[];
}
export interface TransformationResult {
  hl7Message: string; status: 'SUCCESS' | 'SUCCESS_WITH_WARNINGS' | 'FAILED';
  warnings: string[]; errors: string[]; audit: Audit; fields: FieldTrace[]; alignments: TerminologyAlignment[];
}
export interface EventContext { trigger: 'S12'; confirmed: boolean }
