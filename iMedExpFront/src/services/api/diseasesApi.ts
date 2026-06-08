import { authedRequest } from "@/services/api/authedRequest";

export type Disease = {
  id: number;
  name: string;
  cie10_code: string | null;
};

/**
 * Get-or-create a disease from a free-text name (and optional CIE-10 code).
 * The doctor types the diagnosis; the backend resolves it to a catalog id.
 */
export function ensureDisease(name: string, cie10Code?: string | null): Promise<Disease> {
  return authedRequest<Disease>("/api/v1/diseases/ensure", {
    method: "POST",
    body: JSON.stringify({ name, cie10_code: cie10Code ?? null })
  });
}

export function searchDiseases(q: string): Promise<Disease[]> {
  return authedRequest<Disease[]>(`/api/v1/diseases/search?q=${encodeURIComponent(q)}`, {
    method: "GET"
  });
}

export function fetchDisease(diseaseId: number): Promise<Disease> {
  return authedRequest<Disease>(`/api/v1/diseases/${diseaseId}`, {
    method: "GET"
  });
}
