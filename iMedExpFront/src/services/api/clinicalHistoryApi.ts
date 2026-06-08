import { authedRequest } from "@/services/api/authedRequest";

export type Vaccine = {
  id: number;
  name: string;
  dose: string | null;
  applied_on: string | null;
  notes: string | null;
  created_at: string;
};

export type Surgery = {
  id: number;
  name: string;
  performed_on: string | null;
  hospital: string | null;
  notes: string | null;
  created_at: string;
};

export type Allergy = {
  id: number;
  substance: string;
  reaction: string | null;
  severity: string | null;
  notes: string | null;
  created_at: string;
};

export type Antecedent = {
  id: number;
  kind: string;
  description: string;
  notes: string | null;
  created_at: string;
};

const base = "/api/v1/clinical-history/me";

export const listVaccines = () => authedRequest<Vaccine[]>(`${base}/vaccines`);
export const addVaccine = (body: Partial<Vaccine>) =>
  authedRequest<Vaccine>(`${base}/vaccines`, { method: "POST", body: JSON.stringify(body) });
export const deleteVaccine = (id: number) =>
  authedRequest<void>(`${base}/vaccines/${id}`, { method: "DELETE" });

export const listSurgeries = () => authedRequest<Surgery[]>(`${base}/surgeries`);
export const addSurgery = (body: Partial<Surgery>) =>
  authedRequest<Surgery>(`${base}/surgeries`, { method: "POST", body: JSON.stringify(body) });
export const deleteSurgery = (id: number) =>
  authedRequest<void>(`${base}/surgeries/${id}`, { method: "DELETE" });

export const listAllergies = () => authedRequest<Allergy[]>(`${base}/allergies`);
export const addAllergy = (body: Partial<Allergy>) =>
  authedRequest<Allergy>(`${base}/allergies`, { method: "POST", body: JSON.stringify(body) });
export const deleteAllergy = (id: number) =>
  authedRequest<void>(`${base}/allergies/${id}`, { method: "DELETE" });

export const listAntecedents = () => authedRequest<Antecedent[]>(`${base}/antecedents`);
export const addAntecedent = (body: Partial<Antecedent>) =>
  authedRequest<Antecedent>(`${base}/antecedents`, { method: "POST", body: JSON.stringify(body) });
export const deleteAntecedent = (id: number) =>
  authedRequest<void>(`${base}/antecedents/${id}`, { method: "DELETE" });
