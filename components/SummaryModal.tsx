"use client";

import { useEffect } from "react";
import { getQuestionById } from "@/lib/questions";

interface Props {
  questionId: string | null;
  summary: string | undefined;
  rawAnswers: string[];
  generating: boolean;
  onClose: () => void;
  onRegenerate: () => void;
}

export default function SummaryModal({
  questionId,
  summary,
  rawAnswers,
  generating,
  onClose,
  onRegenerate,
}: Props) {
  // ESC 로 닫기
  useEffect(() => {
    if (!questionId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [questionId, onClose]);

  if (!questionId) return null;
  const q = getQuestionById(questionId);
  if (!q) return null;

  const hasAnswers = rawAnswers.length > 0;
  const hasSummary = !!summary && summary.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-zinc-200 px-5 py-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              [{q.id}] {q.blockTitle}
            </div>
            <h3 className="mt-1 text-base font-semibold text-zinc-900">
              {q.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="닫기"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-5">
          <section>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-700">정리</h4>
              {hasAnswers && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  disabled={generating}
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 underline underline-offset-2 disabled:opacity-50"
                >
                  {generating ? "생성 중…" : "다시 정리"}
                </button>
              )}
            </div>
            <div className="mt-2 rounded-lg bg-zinc-50 px-3 py-3 text-sm leading-relaxed text-zinc-900">
              {generating && !hasSummary ? (
                <span className="text-zinc-500">정리 중…</span>
              ) : hasSummary ? (
                <span className="whitespace-pre-wrap">{summary}</span>
              ) : hasAnswers ? (
                <span className="text-zinc-500">
                  아직 정리되지 않았어요. 잠시 후 자동으로 정리됩니다.
                </span>
              ) : (
                <span className="text-zinc-500">아직 답변이 없어요.</span>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-semibold text-zinc-700">내가 한 말</h4>
            {hasAnswers ? (
              <ol className="mt-2 space-y-2">
                {rawAnswers.map((a, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm leading-relaxed text-zinc-800"
                  >
                    <span className="mr-2 text-[11px] text-zinc-400">
                      {i + 1}
                    </span>
                    <span className="whitespace-pre-wrap">{a}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">
                이 질문에는 아직 답변이 없어요.
              </p>
            )}
          </section>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
