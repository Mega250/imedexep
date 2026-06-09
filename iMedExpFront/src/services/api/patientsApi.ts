import { apiRequest } from "@/services/api/client";
import { authedRequest } from "@/services/api/authedRequest";
import { ListResponse, PageQuery } from "@/services/api/types";
import { toQueryString } from "@/services/api/query";

export type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string | null;
  blood_type: string | null;
  phone?: string | null;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  sensitivity_level: number;
  created_at: string;
  archived_at: string | null;
};

export type PatientFull = Patient & {
  street_address: string | null;
  neighborhood: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  temperature_celsius: number | null;
  oxygen_saturation: number | null;
  glucose_mg_dl: number | null;
  glucose_risk: string | null;
};

export type PatientCreate = {
  curp: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string | null;
  blood_type?: string | null;
  phone?: string | null;
  street_address?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
  city?: string | null;
  state?: string | null;
  sensitivity_level?: number;
};

export type PatientUpdate = Partial<Omit<PatientCreate, "curp" | "date_of_birth">>;

export function listPatients(token: string, query: PageQuery = {}): Promise<ListResponse<Patient>> {
  return apiRequest<ListResponse<Patient>>(`/api/v1/patients/${toQueryString(query)}`, {
    method: "GET",
    token
  });
}

export function getPatient(token: string, patientId: number): Promise<Patient> {
  return apiRequest<Patient>(`/api/v1/patients/${patientId}`, {
    method: "GET",
    token
  });
}

export function getPatientFull<T>(token: string, patientId: number): Promise<T> {
  return apiRequest<T>(`/api/v1/patients/${patientId}/full`, {
    method: "GET",
    token
  });
}

export function createPatient(token: string, payload: PatientCreate): Promise<Patient> {
  return apiRequest<Patient>("/api/v1/patients/", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function createPatientAuthed(payload: PatientCreate): Promise<Patient> {
  return authedRequest<Patient>("/api/v1/patients/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updatePatient(token: string, patientId: number, payload: PatientUpdate): Promise<Patient> {
  return apiRequest<Patient>(`/api/v1/patients/${patientId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}

export function updatePatientAuthed(patientId: number, payload: PatientUpdate): Promise<Patient> {
  return authedRequest<Patient>(`/api/v1/patients/${patientId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function fetchPatient(patientId: number): Promise<Patient> {
  return authedRequest<Patient>(`/api/v1/patients/${patientId}`, { method: "GET" });
}

export function fetchPatientByCurp(curp: string): Promise<Patient> {
  return authedRequest<Patient>(`/api/v1/patients/by-curp/${encodeURIComponent(curp)}`, {
    method: "GET"
  });
}

export function fetchPatientFull(patientId: number): Promise<PatientFull> {
  return authedRequest<PatientFull>(`/api/v1/patients/${patientId}/full`, { method: "GET" });
}

export function fetchPatientsList(query: PageQuery = {}): Promise<ListResponse<Patient>> {
  return authedRequest<ListResponse<Patient>>(`/api/v1/patients/${toQueryString(query)}`, {
    method: "GET"
  });
}

export type SocioeconomicData = {
  drainage: string | null;
  water: string | null;
  electricity: string | null;
  household_members: string | null;
  cooking_material: string | null;
  cooking_method: string | null;
};

export function fetchSocioeconomic(patientId: number): Promise<SocioeconomicData> {
  return authedRequest<SocioeconomicData>(`/api/v1/patients/${patientId}/socioeconomic`, {
    method: "GET"
  });
}

export function patchSocioeconomic(
  patientId: number,
  payload: Partial<SocioeconomicData>
): Promise<SocioeconomicData> {
  return authedRequest<SocioeconomicData>(`/api/v1/patients/${patientId}/socioeconomic`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
