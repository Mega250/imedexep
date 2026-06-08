import { authedRequest } from "@/services/api/authedRequest";
import { Doctor } from "@/services/api/doctorsApi";
import { loadSession } from "@/state/sessionStore";

export type Secretary = {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  employee_number: string | null;
  contact_phone: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
};

export type SecretaryDoctorAssignment = {
  id: number;
  secretary_id: number;
  secretary_name: string;
  doctor_id: number;
  doctor_name: string;
  assigned_by_user_id: number;
  created_at: string;
};

export type SecretaryCreatePayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  employee_number?: string | null;
  contact_phone?: string | null;
};

export type SecretaryUpdatePayload = Partial<Pick<
  Secretary,
  "first_name" | "last_name" | "employee_number" | "contact_phone" | "is_active"
>>;

export type AssignDoctorPayload = {
  doctor_id: number;
};

export type SecretaryMessageResponse = {
  message: string;
};

export function fetchSecretaries(): Promise<Secretary[]> {
  return authedRequest<Secretary[]>("/api/v1/secretary/", { method: "GET" });
}

export function fetchMySecretaryProfile(): Promise<Secretary> {
  return authedRequest<Secretary>("/api/v1/secretary/me", { method: "GET" });
}

export function updateMySecretaryProfile(payload: SecretaryUpdatePayload): Promise<Secretary> {
  return authedRequest<Secretary>("/api/v1/secretary/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function fetchSecretaryAssignments(): Promise<SecretaryDoctorAssignment[]> {
  return authedRequest<SecretaryDoctorAssignment[]>("/api/v1/secretary/assignments", {
    method: "GET"
  });
}

export function createSecretary(payload: SecretaryCreatePayload): Promise<Secretary> {
  return authedRequest<Secretary>("/api/v1/secretary/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateSecretary(
  secretaryId: number,
  payload: SecretaryUpdatePayload
): Promise<Secretary> {
  return authedRequest<Secretary>(`/api/v1/secretary/${secretaryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function assignSecretaryToDoctor(
  secretaryId: number,
  payload: AssignDoctorPayload
): Promise<SecretaryMessageResponse> {
  return authedRequest<SecretaryMessageResponse>(`/api/v1/secretary/${secretaryId}/doctors`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function unassignSecretaryFromDoctor(
  secretaryId: number,
  doctorId: number
): Promise<SecretaryMessageResponse> {
  return authedRequest<SecretaryMessageResponse>(
    `/api/v1/secretary/${secretaryId}/doctors/${doctorId}`,
    { method: "DELETE" }
  );
}

export function deleteSecretary(secretaryId: number): Promise<Secretary> {
  return authedRequest<Secretary>(`/api/v1/secretary/${secretaryId}`, {
    method: "DELETE"
  });
}

export async function fetchInstitutionDoctors(): Promise<Doctor[]> {
  const session = await loadSession();
  const role = session.user?.role;
  if (role === "institution_admin" || role === "superadmin") {
    try {
      return await authedRequest<Doctor[]>("/api/v1/doctors/institution", { method: "GET" });
    } catch {
      const list = await authedRequest<{ items: Doctor[] }>("/api/v1/doctors/?limit=100", {
        method: "GET"
      });
      return list.items ?? [];
    }
  }
  const list = await authedRequest<{ items: Doctor[] }>("/api/v1/doctors/?limit=100", {
    method: "GET"
  });
  return list.items ?? [];
}
