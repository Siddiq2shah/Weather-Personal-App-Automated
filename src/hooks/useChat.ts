import { useCallback, useEffect, useState } from "react";
import {
  clearChatHistory,
  fetchChatHistory,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/chat";

const SESSION_STORAGE_KEY = "skyline-chat-session";

function getSessionId(): string {
  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

export function useChat(weatherContext: string) {
  const [sessionId] = useState<string>(getSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);
    fetchChatHistory(sessionId)
      .then((history) => {
        if (!cancelled) setMessages(history);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load your conversation.");
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const optimistic: ChatMessage = {
        id: `pending-${Date.now()}`,
        role: "user",
        content: trimmed,
        created_at: new Date().toISOString(),
      };
      setMessages((current) => [...current, optimistic]);
      setSending(true);
      setError(null);

      try {
        const reply = await sendChatMessage(sessionId, trimmed, weatherContext);
        setMessages((current) => [...current, reply]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't send your message.");
      } finally {
        setSending(false);
      }
    },
    [sending, sessionId, weatherContext],
  );

  const startNewChat = useCallback(async () => {
    setError(null);
    try {
      await clearChatHistory(sessionId);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't clear the conversation.");
    }
  }, [sessionId]);

  return { messages, historyLoading, sending, error, send, startNewChat };
}
