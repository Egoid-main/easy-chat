"use client";

import { QUESTIONS } from "@/lib/questions";
import type { BlockId } from "@/types";

interface Props {
  currentQuestionId: string;
  isComplete: boolean;
  /** 답변이 1개 이상 들어온 질문 ID 집합 (보기 가능 표시) */
  answeredIds: Set<string>;
  /** 정리(summary)가 생성된 질문 ID 집합 */
  summaryIds: Set<string>;
  onSelect: (questionId: string) => void;
  onReset: () => void;
}

const BLOCK_ORDER: BlockId[] = ["0", "1", "2", "3", "4"];

const BLOCK_STYLES: Record<BlockId, { dot: string; ring: string; label: string }> = {
  "0": { dot: "bg-block0", ring: "ring-block0/40", label: "🟦 0" },
  "1": { dot: "bg-block1", ring: "ring-block1/40", label: "🟨 1" },
  "2": { dot: "bg-block2", ring: "ring-block2/40", label: "🟩 2" },
  "3": { dot: "bg-block3", ring: "ring-block3/40", label: "🟪 3" },
  "4": { dot: "bg-block4", ring: "ring-block4/40", label: "🟧 4" },
};

export default function MilestoneSidebar({
  currentQuestionId,
  isComplete,
  answeredIds,
  summaryIds,
  onSelect,
  onReset,
}: Props) {
  const currentIndex = QUESTIONS.findIndex((q) => q.id === currentQuestionId);

  const grouped = BLOCK_ORDER.map((bid) => ({
    block: bid,
    title: QUESTIONS.find((q) => q.block === bid)?.blockTitle ?? "",
    items: QUESTIONS.filter((q) => q.block === bid),
  }));

  return (
    <aside className="w-[280px] shrink-0 border-r border-zinc-200 bg-zinc-50 h-screen overflow-y-auto p-5">
      <h1 className="text-base font-semibold text-zinc-900">
        사업계획서 작성
      </h1>
      <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
        완료된 항목은 클릭해 정리 내용을 확인할 수 있어요.
      </p>

      <div className="mt-6 space-y-6">
        {grouped.map(({ block, title, items }) => {
          const style = BLOCK_STYLES[block];
          return (
            <section key={block}>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                <span>{style.label}</span>
                <span>{title}</span>
              </div>

              <ol className="mt-3 space-y-1">
                {items.map((q) => {
                  const idx = QUESTIONS.findIndex((x) => x.id === q.id);
                  const done = isComplete || idx < currentIndex;
                  const active = !isComplete && idx === currentIndex;
                  const hasAnswer = answeredIds.has(q.id);
                  const hasSummary = summaryIds.has(q.id);
                  const clickable = hasAnswer; // 답변이 있으면 클릭 가능

                  return (
                    <li key={q.id}>
                      <button
                        type="button"
                        disabled={!clickable}
                        onClick={() => onSelect(q.id)}
                        className={[
                          "group flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm leading-snug transition",
                          clickable
                            ? "hover:bg-zinc-200/60 cursor-pointer"
                            : "cursor-default",
                          active ? "text-zinc-900 font-medium" : "",
                          done ? "text-zinc-400" : "",
                          !active && !done ? "text-zinc-500" : "",
                        ].join(" ")}
                        aria-label={
                          clickable
                            ? `${q.title} 정리 내용 보기`
                            : q.title
                        }
                      >
                        <span
                          className={[
                            "mt-1 inline-block size-2.5 rounded-full shrink-0",
                            done ? "bg-zinc-300" : style.dot,
                            active ? `ring-4 ${style.ring}` : "",
                          ].join(" ")}
                          aria-hidden
                        />
                        <span className="flex-1">
                          <span className="text-[11px] mr-1 text-zinc-400">
                            {q.id}
                          </span>
                          {q.title}
                        </span>
                        {clickable && (
                          <span
                            className={[
                              "mt-0.5 shrink-0 text-[10px]",
                              hasSummary ? "text-zinc-500" : "text-zinc-400",
                            ].join(" ")}
                            title={hasSummary ? "정리 완료" : "정리 중"}
                            aria-hidden
                          >
                            {hasSummary ? "보기" : "…"}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-8 w-full text-xs text-zinc-500 hover:text-zinc-800 underline underline-offset-2"
      >
        대화 초기화
      </button>
    </aside>
  );
}
