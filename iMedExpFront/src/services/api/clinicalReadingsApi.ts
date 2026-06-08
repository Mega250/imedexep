import { authedRequest } from "@/services/api/authedRequest";

export type Glucose = {
  id: number;
  value_mg_dl: number;
  context: string | null;
  measured_on: string | null;
  notes: string | null;
  created_at: string;
};

export type Weight = {
  id: number;
  weight_kg: number;
  height_m: number | null;
  measured_on: string | null;
  notes: string | null;
  created_at: string;
};

export const listGlucose = () =>
  authedRequest<Glucose[]>("/api/v1/clinical-readings/me/glucose");

export const addGlucose = (body: {
  value_mg_dl: number;
  context?: string;
  measured_on?: string;
  notes?: string;
}) =>
  authedRequest<Glucose>("/api/v1/clinical-readings/me/glucose", {
    method: "POST",
    body: JSON.stringify(body)
  });

export const deleteGlucose = (id: number) =>
  authedRequest<void>(`/api/v1/clinical-readings/me/glucose/${id}`, { method: "DELETE" });

export const listWeight = () =>
  authedRequest<Weight[]>("/api/v1/clinical-readings/me/weight");

export const addWeight = (body: {
  weight_kg: number;
  height_m?: number;
  measured_on?: string;
  notes?: string;
}) =>
  authedRequest<Weight>("/api/v1/clinical-readings/me/weight", {
    method: "POST",
    body: JSON.stringify(body)
  });

export const deleteWeight = (id: number) =>
  authedRequest<void>(`/api/v1/clinical-readings/me/weight/${id}`, { method: "DELETE" });
