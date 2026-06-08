import { authedRequest } from "@/services/api/authedRequest";

export type PersonalLogRole = "estudiante" | "docente" | "admin";

export type PersonalLogEntry = {
  id: number;
  role: PersonalLogRole;
  fields: Record<string, string>;
  created_at: string;
};

export type PersonalLogPayload = {
  role: PersonalLogRole;
  fields: Record<string, string>;
};

export function createPersonalLog(payload: PersonalLogPayload): Promise<PersonalLogEntry> {
  return authedRequest<PersonalLogEntry>("/api/v1/personal-log/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchPersonalLogs(limit = 200): Promise<PersonalLogEntry[]> {
  return authedRequest<PersonalLogEntry[]>(`/api/v1/personal-log/?limit=${limit}`, {
    method: "GET"
  });
}

export function deletePersonalLog(logId: number): Promise<void> {
  return authedRequest<void>(`/api/v1/personal-log/${logId}`, { method: "DELETE" });
}
