import { authedRequest } from "@/services/api/authedRequest";
import { ListResponse, PageQuery } from "@/services/api/types";
import { toQueryString } from "@/services/api/query";

export type ConsultationSummary = {
  id: number;
  patient_id: number;
  doctor_id: number;
  institution_id: number;
  appointment_id: number | null;
  chief_complaint: string | null;
  notes: string | null;
  signed: boolean | null;
  signed_at: string | null;
  created_at: string;
};

export type ConsultationListQuery = PageQuery & {
  patient_id?: number;
  doctor_id?: number;
};

export function fetchConsultations(query: ConsultationListQuery = {}): Promise<ListResponse<ConsultationSummary>> {
  return authedRequest<ListResponse<ConsultationSummary>>(`/api/v1/consultations/${toQueryString(query)}`, {
    method: "GET"
  });
}

/** Full shape returned by the backend (POST / and GET /{id}). */
export type ConsultationDetail = {
  id: number;
  parent_id: number | null;
  version: number;
  is_current: boolean;
  appointment_id: number | null;
  institution_id: number;
  patient_id: number;
  doctor_id: number;
  consulted_at: string;
  chief_complaint: string | null;
  symptoms: string | null;
  medical_notes: string | null;
  sensitivity_level: number;
  specialty_data: Record<string, unknown> | null;
  signature_hash: string | null;
  signed_at: string | null;
  created_at: string;
};

export type ConsultationCreatePayload = {
  patient_id: number;
  chief_complaint?: string | null;
  symptoms?: string | null;
  medical_notes?: string | null;
  sensitivity_level?: number;
  specialty_data?: Record<string, unknown> | null;
};

export function startConsultation(payload: ConsultationCreatePayload): Promise<ConsultationDetail> {
  return authedRequest<ConsultationDetail>("/api/v1/consultations/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchConsultation(consultationId: number): Promise<ConsultationDetail> {
  return authedRequest<ConsultationDetail>(`/api/v1/consultations/${consultationId}`, {
    method: "GET"
  });
}

export type DiagnosisType = "primary" | "secondary" | "differential";

export type DiagnosisRecord = {
  id: number;
  consultation_id: number;
  disease_id: number;
  diagnosis_type: DiagnosisType;
  additional_notes: string | null;
  created_at: string;
};

export type DiagnosisCreatePayload = {
  disease_id: number;
  diagnosis_type?: DiagnosisType;
  additional_notes?: string | null;
};

export function addDiagnosis(consultationId: number, payload: DiagnosisCreatePayload): Promise<DiagnosisRecord> {
  return authedRequest<DiagnosisRecord>(`/api/v1/consultations/${consultationId}/diagnosis`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchDiagnoses(consultationId: number): Promise<DiagnosisRecord[]> {
  return authedRequest<DiagnosisRecord[]>(`/api/v1/consultations/${consultationId}/diagnosis`, {
    method: "GET"
  });
}
