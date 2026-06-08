import { authedRequest } from "@/services/api/authedRequest";
import { QrRedeemResponse } from "@/services/api/qrApi";

export type QrRedeemPayload = {
  code: string;
};

export function redeemQrAccessCode(code: string): Promise<QrRedeemResponse> {
  return authedRequest<QrRedeemResponse>("/api/v1/qr-access/redeem", {
    method: "POST",
    body: JSON.stringify({ verification_code: code })
  });
}
