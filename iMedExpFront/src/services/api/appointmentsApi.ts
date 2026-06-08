import { apiRequest } from "@/services/api/client";
import { authedRequest } from "@/services/api/authedRequest";
import { ListResponse, PageQuery } from "@/services/api/types";
import { toQueryString } from "@/services/api/query";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentCreate = {
  patient_id: number;
  doctor_id: number;
  institution_id?: number | null;
  scheduled_at: string;
  reason?: string;
};

export type AppointmentUpdate = Partial<AppointmentCreate> & {
  status?: AppointmentStatus;
};

export type Appointment = {
  id: number;
  patient_id: number;
  doctor_id: number;
  institution_id: number;
  created_by_user_id: number;
  scheduled_at: string;
  reason: string | null;
  status: AppointmentStatus;
  created_at: string;
  doctor_name?: string | null;
  institution_name?: string | null;
};

export type AppointmentListQuery = PageQuery & {
  patient_id?: number;
  doctor_id?: number;
};

export function listAppointments(token: string, query: PageQuery = {}): Promise<ListResponse<Appointment>> {
  return apiRequest<ListResponse<Appointment>>(`/api/v1/appointments/${toQueryString(query)}`, {
    method: "GET",
    token
  });
}

export function createAppointment(token: string, payload: AppointmentCreate): Promise<Appointment> {
  return apiRequest<Appointment>("/api/v1/appointments/", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function updateAppointment(token: string, appointmentId: number, payload: AppointmentUpdate): Promise<Appointment> {
  return apiRequest<Appointment>(`/api/v1/appointments/${appointmentId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}

export function fetchAppointments(query: AppointmentListQuery = {}): Promise<ListResponse<Appointment>> {
  return authedRequest<ListResponse<Appointment>>(`/api/v1/appointments/${toQueryString(query)}`, {
    method: "GET"
  });
}

export function postAppointment(payload: AppointmentCreate): Promise<Appointment> {
  return authedRequest<Appointment>("/api/v1/appointments/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function patchAppointment(appointmentId: number, payload: AppointmentUpdate): Promise<Appointment> {
  return authedRequest<Appointment>(`/api/v1/appointments/${appointmentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
