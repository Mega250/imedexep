import { authedRequest } from "@/services/api/authedRequest";

export type InvitationStatus = "pending" | "accepted" | "rejected";

export type Invitation = {
  id: number;
  institution_id: number;
  institution_name: string;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
};

export type InvitationActionResponse = {
  message: string;
  status: InvitationStatus;
};

export function respondInvitation(
  invitationId: number,
  accept: boolean
): Promise<InvitationActionResponse> {
  return authedRequest<InvitationActionResponse>(`/api/v1/invitations/${invitationId}`, {
    method: "PATCH",
    body: JSON.stringify({ accept })
  });
}

export function fetchInvitations(): Promise<Invitation[]> {
  return authedRequest<Invitation[]>("/api/v1/invitations/", { method: "GET" });
}
