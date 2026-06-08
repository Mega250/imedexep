import { apiRequest } from "@/services/api/client";
import { authedRequest } from "@/services/api/authedRequest";

export type MenstrualFlow = "spotting" | "light" | "medium" | "heavy";

export type MenstrualCycleCreate = {
  patient_id: number;
  period_start_date: string;
  period_end_date?: string;
  flow?: MenstrualFlow;
  symptoms?: Record<string, string | number | boolean | string[]>;
  notes?: string;
  source?: string;
};

export type MenstrualCycle = {
  id: number;
  patient_id: number;
  period_start_date: string;
  period_end_date: string | null;
  flow: MenstrualFlow | null;
  symptoms: Record<string, string | number | boolean | string[]>;
  notes: string | null;
  source: string;
  created_at: string;
  duration_days: number | null;
};

export type MenstrualCycleListResponse = {
  patient_id: number;
  total: number;
  items: MenstrualCycle[];
};

export type MenstrualPredictionModel = {
  name: string;
  version: string;
  training_sample_size: number;
  features: string[];
};

export type MenstrualPrediction = {
  patient_id: number;
  as_of: string;
  regularity: string;
  average_cycle_length_days: number | null;
  cycle_length_stddev_days: number | null;
  predicted_cycle_length_days: number;
  predicted_period_duration_days: number;
  predicted_next_period_start: string;
  predicted_next_period_end: string;
  prediction_window_start: string;
  prediction_window_end: string;
  confidence: number;
  recent_cycle_lengths_days: number[];
  warnings: string[];
  model: MenstrualPredictionModel;
};

export function createMenstrualCycle(token: string, payload: MenstrualCycleCreate): Promise<MenstrualCycle> {
  return apiRequest<MenstrualCycle>("/api/v1/menstrual-cycles/", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function listPatientMenstrualCycles(token: string, patientId: number): Promise<MenstrualCycleListResponse> {
  return apiRequest<MenstrualCycleListResponse>(`/api/v1/menstrual-cycles/patient/${patientId}`, {
    method: "GET",
    token
  });
}

export function getMenstrualPrediction(token: string, patientId: number): Promise<MenstrualPrediction> {
  return apiRequest<MenstrualPrediction>(`/api/v1/menstrual-cycles/patient/${patientId}/prediction`, {
    method: "GET",
    token
  });
}

export function fetchMenstrualCycles(patientId: number, limit = 24): Promise<MenstrualCycleListResponse> {
  return authedRequest<MenstrualCycleListResponse>(`/api/v1/menstrual-cycles/patient/${patientId}?limit=${limit}`, {
    method: "GET"
  });
}

export function fetchMenstrualPrediction(patientId: number): Promise<MenstrualPrediction> {
  return authedRequest<MenstrualPrediction>(`/api/v1/menstrual-cycles/patient/${patientId}/prediction`, {
    method: "GET"
  });
}

export function postMenstrualCycle(payload: MenstrualCycleCreate): Promise<MenstrualCycle> {
  return authedRequest<MenstrualCycle>("/api/v1/menstrual-cycles/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateMenstrualCycle(
  cycleId: number,
  body: { period_start_date?: string; period_end_date?: string | null; flow?: string | null }
): Promise<MenstrualCycle> {
  return authedRequest<MenstrualCycle>(`/api/v1/menstrual-cycles/${cycleId}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export function deleteMenstrualCycle(cycleId: number): Promise<void> {
  return authedRequest<void>(`/api/v1/menstrual-cycles/${cycleId}`, {
    method: "DELETE"
  });
}
