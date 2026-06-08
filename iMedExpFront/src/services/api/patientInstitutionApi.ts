import { authedRequest } from "@/services/api/authedRequest";

export type PatientInstitution = {
  id: number;
  patient_id: number;
  institution_id: number;
  institution_name: string | null;
  record_number: string | null;
  linked_at: string;
  unlinked_at: string | null;
};

export type PatientInstitutionCreate = {
  patient_id: number;
  institution_id: number;
  record_number?: string | null;
};

export function fetchPatientInstitutions(patientId: number): Promise<PatientInstitution[]> {
  return authedRequest<PatientInstitution[]>(`/api/v1/patient-institution/${patientId}`, {
    method: "GET"
  });
}

export function postPatientInstitution(
  payload: PatientInstitutionCreate
): Promise<PatientInstitution> {
  return authedRequest<PatientInstitution>("/api/v1/patient-institution/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function setMyInstitutionAccess(
  institutionId: number,
  active: boolean
): Promise<void> {
  return authedRequest<void>(`/api/v1/patient-institution/me/${institutionId}?active=${active}`, {
    method: "PATCH"
  });
}
