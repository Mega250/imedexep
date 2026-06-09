import { authedRequest } from "@/services/api/authedRequest";
import { apiBaseUrl } from "@/services/api/client";
import { loadSession } from "@/state/sessionStore";

export type PatientNotification = {
  id: number;
  patient_id: number;
  kind: string;
  message: string;
  status: string;
  created_at: string;
};

export type Certificate = {
  id: number;
  patient_id: number;
  doctor_id: number;
  title: string;
  body: string;
  issued_at: string;
};

export const createNotification = (body: { kind: string; message: string }) =>
  authedRequest<PatientNotification>("/api/v1/notifications/me", {
    method: "POST",
    body: JSON.stringify(body)
  });

export const listMyNotifications = () =>
  authedRequest<PatientNotification[]>("/api/v1/notifications/me");

export const listPatientNotifications = (patientId: number) =>
  authedRequest<PatientNotification[]>(`/api/v1/notifications/patient/${patientId}`);

export const issueCertificate = (body: { patient_id: number; title: string; body: string }) =>
  authedRequest<Certificate>("/api/v1/certificates", {
    method: "POST",
    body: JSON.stringify(body)
  });

export const listMyCertificates = () => authedRequest<Certificate[]>("/api/v1/certificates/me");

export async function openCertificatePdf(id: number): Promise<void> {
  const session = await loadSession();
  const token = session.tokens?.access_token;
  const res = await fetch(`${apiBaseUrl}/api/v1/certificates/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  if (!res.ok) {
    throw new Error("No pudimos generar el PDF.");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  if (typeof window !== "undefined") {
    window.open(url, "_blank");
  }
}
