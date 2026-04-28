"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  disabled?: boolean;
  loading?: boolean;
  onSend: (text: string) => void;
  placeholder?: string;
}

export default function ChatInput({ disabled, loading, onSend, placeholder }: Props) {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // 자동 높이 조절
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [text]);

  function submit() {
    const v = text.trim();
    if (!v || disabled || loading) return;
    onSend(v);
    setText("");
  }

  return (
    <div className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl p-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            disabled={disabled || loading}
            placeholder={
              placeholder ?? "여기에 답변을 적어 주세요. (Enter로 전송 · Shift+Enter 줄바꿈)"
            }
            className="flex-1 resize-none rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none disabled:bg-zinc-100"
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled || loading || text.trim().length === 0}
            className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300"
          >
            {loading ? "..." : "전송"}
          </button>
        </div>
      </div>
    </div>
  );
}
