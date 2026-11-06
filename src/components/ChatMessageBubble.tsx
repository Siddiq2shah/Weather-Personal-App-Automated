import { Bot } from "lucide-react";
import type { ChatMessage } from "@/lib/chat";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className={`flex items-end gap-2 animate-message ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <div className={`flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "rounded-br-md bg-sky-600 text-white"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          }`}
        >
          {message.content}
        </div>
        <span className="mt-1 px-1 text-[11px] text-slate-500 dark:text-slate-400">{time}</span>
      </div>
    </div>
  );
}
