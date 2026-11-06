import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LLM_URL = "https://gen.pollinations.ai/v1/chat/completions";
const LLM_MODEL = "openai";
const HISTORY_LIMIT = 20;
const HISTORY_FETCH_LIMIT = 200;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_WEATHER_CONTEXT_LENGTH = 2000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SYSTEM_PROMPT = `You are Skyline, a friendly and concise AI assistant built into a weather app.
You answer weather questions using the live weather data provided below, and you also answer general questions on any topic.
Use Fahrenheit for temperatures unless the user asks otherwise. Keep replies under 120 words unless more detail is requested.
When asked what to wear, suggest practical outfit ideas for a young woman (tops and bottoms).`;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function readSessionId(url: URL): string | null {
  const sessionId = url.searchParams.get("sessionId");
  return sessionId && UUID_PATTERN.test(sessionId) ? sessionId : null;
}

async function fetchHistory(sessionId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_FETCH_LIMIT);
  if (error) throw error;
  return (data ?? []).reverse();
}

async function askLanguageModel(
  history: { role: string; content: string }[],
  weatherContext: string,
): Promise<string> {
  const systemContent = weatherContext
    ? `${SYSTEM_PROMPT}\n\nLive weather data for the location the user is viewing:\n${weatherContext}`
    : SYSTEM_PROMPT;

  const response = await fetch(LLM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: systemContent },
        ...history.slice(-HISTORY_LIMIT).map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Language model responded with status ${response.status}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || reply.trim().length === 0) {
    throw new Error("Language model returned an empty reply");
  }
  return reply.trim();
}

async function handleSend(req: Request): Promise<Response> {
  const body = await req.json();
  const sessionId = typeof body?.sessionId === "string" && UUID_PATTERN.test(body.sessionId)
    ? body.sessionId
    : null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const weatherContext = typeof body?.weatherContext === "string"
    ? body.weatherContext.slice(0, MAX_WEATHER_CONTEXT_LENGTH)
    : "";

  if (!sessionId) return jsonResponse({ error: "A valid session is required." }, 400);
  if (!message) return jsonResponse({ error: "Please type a message first." }, 400);
  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ error: `Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer.` }, 400);
  }

  const { error: insertError } = await supabase
    .from("chat_messages")
    .insert({ session_id: sessionId, role: "user", content: message });
  if (insertError) throw insertError;

  const history = await fetchHistory(sessionId);

  let reply: string;
  try {
    reply = await askLanguageModel(history, weatherContext);
  } catch (err) {
    console.error("LLM request failed", err);
    return jsonResponse(
      { error: "The assistant is busy right now. Please try again in a moment." },
      502,
    );
  }

  const { data: saved, error: saveError } = await supabase
    .from("chat_messages")
    .insert({ session_id: sessionId, role: "assistant", content: reply })
    .select("id, role, content, created_at")
    .single();
  if (saveError) throw saveError;

  return jsonResponse({ reply: saved });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sessionId = readSessionId(url);

    if (req.method === "POST") {
      return await handleSend(req);
    }

    if (!sessionId) return jsonResponse({ error: "A valid session is required." }, 400);

    if (req.method === "GET") {
      const messages = await fetchHistory(sessionId);
      return jsonResponse({ messages });
    }

    if (req.method === "DELETE") {
      const { error } = await supabase.from("chat_messages").delete().eq("session_id", sessionId);
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Method not allowed." }, 405);
  } catch (err) {
    console.error("Chat function failed", err);
    return jsonResponse({ error: "Something went wrong. Please try again." }, 500);
  }
});
