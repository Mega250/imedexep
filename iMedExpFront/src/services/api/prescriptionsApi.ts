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
