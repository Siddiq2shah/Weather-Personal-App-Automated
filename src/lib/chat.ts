export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const CHAT_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/chat`;

const DEFAULT_ERROR = "Something went wrong. Please try again.";

function requestHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : DEFAULT_ERROR);
  }
  return body;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    typeof message.created_at === "string"
  );
}

export async function fetchChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const response = await fetch(`${CHAT_FUNCTION_URL}?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: requestHeaders(),
  });
  const body = await readJson(response);
  if (!Array.isArray(body.messages) || !body.messages.every(isChatMessage)) {
    throw new Error(DEFAULT_ERROR);
  }
  return body.messages;
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  weatherContext: string,
): Promise<ChatMessage> {
  const response = await fetch(CHAT_FUNCTION_URL, {
    method: "POST",
    headers: requestHeaders(),
    body: JSON.stringify({ sessionId, message, weatherContext }),
  });
  const body = await readJson(response);
  if (!isChatMessage(body.reply)) {
    throw new Error(DEFAULT_ERROR);
  }
  return body.reply;
}

export async function clearChatHistory(sessionId: string): Promise<void> {
  const response = await fetch(`${CHAT_FUNCTION_URL}?sessionId=${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
    headers: requestHeaders(),
  });
  await readJson(response);
}
