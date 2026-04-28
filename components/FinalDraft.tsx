"use client";

import { useState } from "react";

interface Props {
  draft: string;
  loading?: boolean;
  error?: string | null;
  onRegenerate: () => void;
}

export default function FinalDraft({ draft, loading, error, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 클립보드 권한 거부 등 — 무시
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">
            연구 사업계획서 초안
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={loading}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              다시 생성
            </button>
            <button
              type="button"
              onClick={copy}
              disabled={loading || !draft}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300"
            >
              {copied ? "복사됨" : "전체 복사"}
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {loading && !draft ? (
            <div className="text-sm text-zinc-500">초안을 정리하고 있어요…</div>
          ) : (
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-zinc-900">
              {draft}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
