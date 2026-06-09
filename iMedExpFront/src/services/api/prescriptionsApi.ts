import { authedRequest } from "@/services/api/authedRequest";

export type PrescriptionItem = {
  id: number;
  prescription_id: number;
  medication_name: string;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  notes: string | null;
};

export type Prescription = {
  id: number;
  consultation_id: number;
  patient_id: number;
  doctor_id: number;
  notes: string | null;
  signed_at: string | null;
  created_at: string;
  items: PrescriptionItem[];
};

export function fetchPrescriptionsByConsultation(consultationId: number): Promise<Prescription[]> {
  return authedRequest<Prescription[]>(`/api/v1/prescriptions/consultation/${consultationId}`, {
    method: "GET"
  });
}

export type PrescriptionSendResponse = {
  message: string;
  delivered_at: string;
  channel: string;
};

export function sendPrescriptionToPatient(prescriptionId: number): Promise<PrescriptionSendResponse> {
  return authedRequest<PrescriptionSendResponse>(`/api/v1/prescriptions/${prescriptionId}/send`, {
    method: "POST"
  });
}

/**
 * Backend-accurate prescription shape (treatments, not items). Used by the
 * consultation flow; the legacy `Prescription` type above is left untouched
 * for existing screens.
 */
export type Treatment = {
  id: number;
  prescription_id: number;
  medication_id: number | null;
  free_text_medication: string | null;
  dosage: string;
  frequency: string;
  duration_days: number;
  start_date: string;
  additional_notes: string | null;
  calculated_end_date: string | null;
  status: string;
};

export type PrescriptionDetail = {
  id: number;
  consultation_id: number;
  patient_id: number;
  doctor_id: number;
  general_instructions: string | null;
  doctor_name: string | null;
  patient_name: string | null;
  issued_at: string;
  signed_at: string | null;
  signature_hash: string | null;
  treatments: Treatment[];
};

export type TreatmentCreatePayload = {
  medication_id?: number | null;
  free_text_medication?: string | null;
  dosage: string;
  frequency: string;
  duration_days: number;
  start_date: string;
  additional_notes?: string | null;
};

export function createPrescriptionForConsultation(
  consultationId: number,
  payload: { general_instructions?: string | null } = {}
): Promise<PrescriptionDetail> {
  return authedRequest<PrescriptionDetail>(`/api/v1/prescriptions/consultation/${consultationId}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchPrescriptionForConsultation(consultationId: number): Promise<PrescriptionDetail> {
  return authedRequest<PrescriptionDetail>(`/api/v1/prescriptions/consultation/${consultationId}`, {
    method: "GET"
  });
}

export function addTreatment(prescriptionId: number, payload: TreatmentCreatePayload): Promise<Treatment> {
  return authedRequest<Treatment>(`/api/v1/prescriptions/${prescriptionId}/treatments`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function signPrescription(prescriptionId: number, signatureHash: string): Promise<PrescriptionDetail> {
  return authedRequest<PrescriptionDetail>(`/api/v1/prescriptions/${prescriptionId}/sign`, {
    method: "PATCH",
    body: JSON.stringify({ signature_hash: signatureHash })
  });
}
