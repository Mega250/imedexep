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
