"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";

interface Props {
  messages: ChatMessage[];
  loading?: boolean;
}

export default function ChatMessages({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {messages.length === 0 && !loading && (
          <div className="text-sm text-zinc-400 text-center mt-12">
            대화가 곧 시작됩니다…
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={[
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-900",
              ].join(" ")}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-500">
              <span className="inline-flex gap-1">
                <span className="size-1.5 rounded-full bg-zinc-400 animate-pulse" />
                <span className="size-1.5 rounded-full bg-zinc-400 animate-pulse [animation-delay:120ms]" />
                <span className="size-1.5 rounded-full bg-zinc-400 animate-pulse [animation-delay:240ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
