import { authedRequest } from "@/services/api/authedRequest";

export type InvitationCreatePayload = {
  doctor_email: string;
};

export type InvitationResponse = {
  id: number;
  institution_id: number;
  doctor_id: number;
  doctor_name?: string | null;
  doctor_email?: string | null;
  status: string;
  expires_at: string;
  created_at: string;
};

export function createInvitation(payload: InvitationCreatePayload): Promise<InvitationResponse> {
  return authedRequest<InvitationResponse>("/api/v1/invitations/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchSentInvitations(): Promise<InvitationResponse[]> {
  return authedRequest<InvitationResponse[]>("/api/v1/invitations/sent", { method: "GET" });
}

export type InstitutionType = "private_clinic" | "hospital" | "school_dispensary";

export type Institution = {
  id: number;
  type?: InstitutionType;
  name: string;
  address?: string | null;
  phone?: string | null;
  is_active?: boolean;
  created_at?: string;
  deleted_at?: string | null;
  rfc?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  email?: string | null;
  website?: string | null;
  policies?: Record<string, boolean>;
};

export type InstitutionCreate = {
  type: InstitutionType;
  name: string;
  address?: string | null;
  phone?: string | null;
  is_active?: boolean;
};

export type InstitutionUpdate = Partial<InstitutionCreate> & {
  policies?: Record<string, boolean>;
  rfc?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  email?: string | null;
  website?: string | null;
};

export type InstitutionAdmin = {
  id: number;
  institution_id?: number;
  email?: string | null;
  admin_name?: string | null;
  is_active?: boolean;
  user_id?: number;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  created_at?: string;
};

export type InstitutionAdminCreate = {
  email: string;
  admin_name: string;
  password: string;
};

export function fetchInstitutions(): Promise<Institution[]> {
  return authedRequest<Institution[]>("/api/v1/institutions/", { method: "GET" });
}

export function fetchInstitution(institutionId: number): Promise<Institution> {
  return authedRequest<Institution>(`/api/v1/institutions/${institutionId}`, { method: "GET" });
}

export function createInstitution(payload: InstitutionCreate): Promise<Institution> {
  return authedRequest<Institution>("/api/v1/institutions/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateInstitution(
  institutionId: number,
  payload: InstitutionUpdate
): Promise<Institution> {
  return authedRequest<Institution>(`/api/v1/institutions/${institutionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteInstitution(institutionId: number): Promise<void> {
  return authedRequest<void>(`/api/v1/institutions/${institutionId}`, { method: "DELETE" });
}

export function fetchInstitutionAdmins(institutionId: number): Promise<InstitutionAdmin[]> {
  return authedRequest<InstitutionAdmin[]>(`/api/v1/institutions/${institutionId}/admins`, {
    method: "GET"
  });
}

export function createInstitutionAdmin(
  institutionId: number,
  payload: InstitutionAdminCreate
): Promise<InstitutionAdmin> {
  return authedRequest<InstitutionAdmin>(`/api/v1/institutions/${institutionId}/admins`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
