import { apiBaseUrl } from "@/services/api/client";

const AGENT_PREFIX = `${apiBaseUrl}/api/v1/agent`;

export type AssistantBlock = { tool: string; data: unknown };

export type AssistantReply = {
  answer: string;
  conversation_id?: string;
  blocked?: string;
  requires_clinician_review?: boolean;
  blocks?: AssistantBlock[];
};

export type AssistantInput = {
  message: string;
  imageBase64?: string | null;
  token?: string | null;
  conversationId?: string | null;
};

export async function sendToAssistant(input: AssistantInput): Promise<AssistantReply> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (input.token) {
    headers.Authorization = `Bearer ${input.token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${AGENT_PREFIX}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: input.message,
        image_base64: input.imageBase64 ?? null,
        conversation_id: input.conversationId ?? null,
      }),
    });
  } catch {
    return { answer: "No pude conectar con el asistente. Revisa tu conexion e intenta de nuevo." };
  }
  const data = await res.json().catch(() => ({}) as Record<string, unknown>);
  if (!res.ok) {
    return { answer: (data as { detail?: string }).detail || "El asistente no esta disponible ahora mismo." };
  }
  return data as AssistantReply;
}

export async function assistantHealth(): Promise<{ status: string; agent?: string } | null> {
  try {
    const res = await fetch(`${AGENT_PREFIX}/health`);
    if (!res.ok) return null;
    return (await res.json()) as { status: string; agent?: string };
  } catch {
    return null;
  }
}
