import { authedRequest } from "@/services/api/authedRequest";

export type AdminStats = {
  institutions: number;
  patients: number;
  doctors: number;
  secretaries: number;
  institution_admins: number;
  superadmins: number;
  events_24h: number;
  events_total: number;
};

export type InstitutionStats = {
  doctors: number;
  secretaries: number;
  patients: number;
};

export type AuditEvent = {
  event_time: string;
  operation: string;
  table_schema: string;
  table_name: string;
  record_id: number | null;
  app_user_id: number | null;
  app_user_role: string | null;
  institution_id: number | null;
};

export const fetchAdminStats = () => authedRequest<AdminStats>("/api/v1/admin/stats");

export const fetchInstitutionStats = (id: number) =>
  authedRequest<InstitutionStats>(`/api/v1/admin/institutions/${id}/stats`);

export const fetchAuditEvents = (limit = 50) =>
  authedRequest<AuditEvent[]>(`/api/v1/admin/audit?limit=${limit}`);
