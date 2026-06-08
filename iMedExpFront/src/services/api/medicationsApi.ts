import { authedRequest } from "@/services/api/authedRequest";

export type Medication = {
  id: number;
  generic_name: string;
  commercial_name: string | null;
  presentation: string | null;
  administration_route: string | null;
  display_name: string;
};

export function searchMedications(q: string): Promise<Medication[]> {
  return authedRequest<Medication[]>(`/api/v1/medications/search?q=${encodeURIComponent(q)}`, {
    method: "GET"
  });
}
