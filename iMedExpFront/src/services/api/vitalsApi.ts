import { authedRequest } from "@/services/api/authedRequest";

export type VitalSign = {
  id: number;
  patient_id: number;
  recorded_at: string;
  weight: number | null;
  height: number | null;
  heart_rate: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  oxygen_saturation: number | null;
  body_temperature: number | null;
  imc: number | null;
};

export type VitalSignCreatePayload = {
  patient_id: number;
  weight?: number;
  height?: number;
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  oxygen_saturation?: number;
  body_temperature?: number;
  source?: string;
};

export function fetchPatientVitals(patientId: number, limit = 50): Promise<VitalSign[]> {
  return authedRequest<VitalSign[]>(`/api/v1/vitals/patient/${patientId}?limit=${limit}`, {
    method: "GET"
  });
}

export function fetchLatestPatientVitals(patientId: number): Promise<VitalSign> {
  return authedRequest<VitalSign>(`/api/v1/vitals/patient/${patientId}/latest`, {
    method: "GET"
  });
}

export function postVitalSign(payload: VitalSignCreatePayload): Promise<VitalSign> {
  return authedRequest<VitalSign>("/api/v1/vitals/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
