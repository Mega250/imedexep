import { authedRequest } from "@/services/api/authedRequest";

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type MessageResponse = {
  message: string;
};

export function changePassword(payload: ChangePasswordPayload): Promise<MessageResponse> {
  return authedRequest<MessageResponse>("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
