import { apiRequest } from "@/services/api/client";
import { ListResponse, PageQuery } from "@/services/api/types";
import { toQueryString } from "@/services/api/query";

export type ConsultationCreate = {
  patient_id: number;
  doctor_id: number;
  institution_id: number;
  appointment_id?: number;
  chief_complaint?: string;
  notes?: string;
};

export type Consultation = ConsultationCreate & {
  id: number;
  created_at: string;
};

export type DiagnosisCreate = {
  disease_id?: number;
  diagnosis_type: string;
  notes?: string;
};

export type Diagnosis = DiagnosisCreate & {
  id: number;
  consultation_id: number;
  created_at: string;
};

export type LegacyVitalSignCreate = {
  patient_id: number;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
};

export type LegacyVitalSign = LegacyVitalSignCreate & {
  id: number;
  recorded_at: string;
};

export function listConsultations(token: string, query: PageQuery = {}): Promise<ListResponse<Consultation>> {
  return apiRequest<ListResponse<Consultation>>(`/api/v1/consultations/${toQueryString(query)}`, {
    method: "GET",
    token
  });
}

export function createConsultation(token: string, payload: ConsultationCreate): Promise<Consultation> {
  return apiRequest<Consultation>("/api/v1/consultations/", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function createDiagnosis(token: string, consultationId: number, payload: DiagnosisCreate): Promise<Diagnosis> {
  return apiRequest<Diagnosis>(`/api/v1/consultations/${consultationId}/diagnosis`, {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function createLegacyVitalSign(token: string, payload: LegacyVitalSignCreate): Promise<LegacyVitalSign> {
  return apiRequest<LegacyVitalSign>("/api/v1/vitals/", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function listLegacyPatientVitals(token: string, patientId: number): Promise<LegacyVitalSign[]> {
  return apiRequest<LegacyVitalSign[]>(`/api/v1/vitals/patient/${patientId}`, {
    method: "GET",
    token
  });
}
