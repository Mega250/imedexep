import { authedRequest } from "@/services/api/authedRequest";

export type ScreenBlockItem = {
  role: string;
  screen_id: string;
};

export function fetchMyBlockedScreens(): Promise<{ blocked: string[] }> {
  return authedRequest<{ blocked: string[] }>("/api/v1/screen-access/me");
}

export function fetchManagedBlocks(): Promise<ScreenBlockItem[]> {
  return authedRequest<ScreenBlockItem[]>("/api/v1/screen-access/manage");
}

export function setScreenBlock(role: string, screenId: string, blocked: boolean): Promise<void> {
  return authedRequest<void>("/api/v1/screen-access/manage", {
    method: "PUT",
    body: JSON.stringify({ role, screen_id: screenId, blocked })
  });
}
