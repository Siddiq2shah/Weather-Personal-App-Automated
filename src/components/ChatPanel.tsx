import { Bot, MessageCircle, RotateCcw, SendHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { useChat } from "@/hooks/useChat";

const SUGGESTIONS = [
  "What's the weather like right now?",
  "Do I need an umbrella this week?",
  "What should I wear today?",
  "Which day looks best this week?",
];

const MAX_MESSAGE_LENGTH = 1000;

interface ChatPanelProps {
  weatherContext: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2" role="status" aria-label="Skyline is typing">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200">
        <Bot className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="flex gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatPanel({ weatherContext }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, historyLoading, sending, error, send, startNewChat } = useChat(weatherContext);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (open && element) element.scrollTop = element.scrollHeight;
  }, [messages, sending, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const submit = (text: string) => {
    if (!text.trim() || sending) return;
    setDraft("");
    void send(text);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(draft);
  };

  const isEmpty = !historyLoading && messages.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3.5 text-sm font-medium text-white shadow-xl shadow-sky-900/30 transition hover:-translate-y-0.5 hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
          open ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
        }`}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Ask Skyline
      </button>

      <div
        role="dialog"
        aria-modal="false"
        aria-label="Skyline weather assistant"
        aria-hidden={!open}
        className={`fixed inset-0 z-50 flex flex-col bg-white transition duration-300 dark:bg-slate-900 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[38rem] sm:w-[25rem] sm:overflow-hidden sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-2xl dark:sm:border-slate-700 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-sky-600 to-sky-700 px-5 py-4 text-white dark:border-slate-700 dark:from-slate-800 dark:to-sky-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold leading-tight">Skyline</p>
              <p className="text-xs text-sky-100">Weather and anything else</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={startNewChat}
              disabled={sending || messages.length === 0}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              New chat
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-full p-2 text-white transition hover:bg-white/15"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5 dark:bg-slate-950">
          {historyLoading && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">Loading your conversation...</p>
          )}

          {isEmpty && (
            <div className="space-y-4">
              <ChatMessageBubble
                message={{
                  id: "welcome",
                  role: "assistant",
                  content:
                    "Hi Eshal! I can tell you about the weather where you're looking, suggest what to wear, or help with any question you have.",
                  created_at: new Date().toISOString(),
                }}
              />
              <div className="flex flex-wrap gap-2 pl-9">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submit(suggestion)}
                    disabled={sending}
                    className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-sky-800 transition hover:border-sky-400 hover:bg-sky-50 disabled:opacity-50 dark:border-sky-800 dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}

          {sending && <TypingIndicator />}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
            >
              {error}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
        >
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Ask about the weather..."
            aria-label="Message Skyline"
            className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-sky-900"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          >
            <SendHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </>
  );
}
