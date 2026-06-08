import { apiRequest } from "@/services/api/client";
import { authedRequest } from "@/services/api/authedRequest";

export type QRAccess = {
  id: number;
  patient_id: number;
  verification_code: string;
  expires_at: string;
  created_at: string;
};

export type QrPatientSummary = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string | null;
  blood_type: string | null;
  city: string | null;
  state: string | null;
};

export type QrRedeemResponse = {
  message: string;
  patient: QrPatientSummary;
};

export function generateQrAccess(token: string, institutionId: number): Promise<QRAccess> {
  return apiRequest<QRAccess>("/api/v1/qr-access/generate", {
    method: "POST",
    token,
    body: JSON.stringify({ institution_id: institutionId })
  });
}

export function redeemQrAccess(token: string, verificationCode: string, institutionId?: number): Promise<QrRedeemResponse> {
  return apiRequest<QrRedeemResponse>("/api/v1/qr-access/redeem", {
    method: "POST",
    token,
    body: JSON.stringify({
      verification_code: verificationCode,
      institution_id: institutionId
    })
  });
}

export function generateMyQrAccess(): Promise<QRAccess> {
  return authedRequest<QRAccess>("/api/v1/qr-access/generate", {
    method: "POST",
    body: JSON.stringify({})
  });
}
