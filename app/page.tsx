"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MilestoneSidebar from "@/components/MilestoneSidebar";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import FinalDraft from "@/components/FinalDraft";
import SummaryModal from "@/components/SummaryModal";
import {
  createInitialState,
  loadState,
  saveState,
  clearState,
  genId,
} from "@/lib/storage";
import type {
  ChatMessage,
  ChatRequestBody,
  ChatResponseBody,
  ChatState,
  DraftRequestBody,
  DraftResponseBody,
  SummaryRequestBody,
  SummaryResponseBody,
} from "@/types";

export default function Page() {
  const [state, setState] = useState<ChatState | null>(null);
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  // 사이드바에서 선택한 질문 (모달 표시)
  const [viewingQuestionId, setViewingQuestionId] = useState<string | null>(null);
  // 현재 요약 생성 중인 질문 ID 집합
  const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());

  // 초기 상태 로드
  useEffect(() => {
    setState(loadState());
  }, []);

  // 상태 저장
  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  // 첫 진입 시 오프닝 메시지 자동 요청
  useEffect(() => {
    if (!state || startedRef.current) return;
    if (state.messages.length === 0 && !state.isComplete) {
      startedRef.current = true;
      void sendToServer("", state);
    } else {
      startedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.messages.length, state?.isComplete]);

  /** 특정 질문의 답변을 요약해서 state.summaries 에 저장 */
  const generateSummary = useCallback(
    async (questionId: string) => {
      const snap = loadState();
      const entry = snap.answers.find((a) => a.questionId === questionId);
      const answers = entry?.answers ?? [];
      if (answers.length === 0) return;

      setSummarizingIds((prev) => {
        const next = new Set(prev);
        next.add(questionId);
        return next;
      });

      try {
        const body: SummaryRequestBody = { questionId, answers };
        const r = await fetch("/api/summary", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!r.ok) return;
        const data = (await r.json()) as SummaryResponseBody;
        setState((prev) =>
          prev
            ? {
                ...prev,
                summaries: { ...prev.summaries, [questionId]: data.summary },
              }
            : prev
        );
      } catch {
        // 조용히 실패 — 사용자에겐 노출하지 않고, 모달에서 "다시 정리" 버튼으로 재시도 가능
      } finally {
        setSummarizingIds((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      }
    },
    []
  );

  const sendToServer = useCallback(
    async (userText: string, snapshot: ChatState) => {
      setLoading(true);
      setError(null);

      const previousQuestionId = snapshot.currentQuestionId;

      // 사용자 메시지 즉시 반영
      let next: ChatState = { ...snapshot };
      if (userText.trim().length > 0) {
        const userMsg: ChatMessage = {
          id: genId(),
          role: "user",
          content: userText,
          questionId: snapshot.currentQuestionId,
          createdAt: Date.now(),
        };

        const existing = next.answers.find(
          (a) => a.questionId === snapshot.currentQuestionId
        );
        const updatedAnswers = existing
          ? next.answers.map((a) =>
              a.questionId === snapshot.currentQuestionId
                ? { ...a, answers: [...a.answers, userText] }
                : a
            )
          : [
              ...next.answers,
              { questionId: snapshot.currentQuestionId, answers: [userText] },
            ];

        next = {
          ...next,
          messages: [...next.messages, userMsg],
          answers: updatedAnswers,
        };
        setState(next);
      }

      const recent = next.messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const body: ChatRequestBody = {
        state: {
          currentQuestionId: next.currentQuestionId,
          followupCount: next.followupCount,
          answers: next.answers,
        },
        recentMessages: recent,
        userMessage: userText,
      };

      try {
        const r = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${r.status}`);
        }
        const data = (await r.json()) as ChatResponseBody;

        const aiMsg: ChatMessage = {
          id: genId(),
          role: "assistant",
          content: data.message,
          questionId: data.nextQuestionId,
          createdAt: Date.now(),
        };

        setState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, aiMsg],
            currentQuestionId: data.nextQuestionId,
            followupCount: data.followupCount,
            isComplete: data.isComplete,
          };
        });

        // 질문이 advance 됐다면 — 막 끝난 질문의 요약을 백그라운드 생성
        if (data.advance && previousQuestionId !== data.nextQuestionId) {
          void generateSummary(previousQuestionId);
        }
        // 모든 질문이 끝났다면 마지막 질문의 요약도 생성 + 초안 생성
        if (data.isComplete) {
          void generateSummary(previousQuestionId);
          setTimeout(() => generateDraft(), 50);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "알 수 없는 오류";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [generateSummary]
  );

  const generateDraft = useCallback(async () => {
    setDraftLoading(true);
    setError(null);
    try {
      const snapshot = loadState();
      const body: DraftRequestBody = { answers: snapshot.answers };
      const r = await fetch("/api/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${r.status}`);
      }
      const data = (await r.json()) as DraftResponseBody;
      setState((prev) => (prev ? { ...prev, draft: data.draft } : prev));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "알 수 없는 오류";
      setError(msg);
    } finally {
      setDraftLoading(false);
    }
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      if (!state) return;
      void sendToServer(text, state);
    },
    [state, sendToServer]
  );

  const handleReset = useCallback(() => {
    if (!confirm("대화를 초기화하시겠어요? 저장된 답변이 모두 삭제됩니다."))
      return;
    clearState();
    const fresh = createInitialState();
    setState(fresh);
    setViewingQuestionId(null);
    setSummarizingIds(new Set());
    startedRef.current = false;
  }, []);

  // 사이드바에서 답변이 있는 질문들 / 요약이 생성된 질문들
  const answeredIds = useMemo(() => {
    if (!state) return new Set<string>();
    return new Set(
      state.answers.filter((a) => a.answers.length > 0).map((a) => a.questionId)
    );
  }, [state]);

  const summaryIds = useMemo(() => {
    if (!state) return new Set<string>();
    return new Set(
      Object.entries(state.summaries)
        .filter(([, v]) => v && v.trim().length > 0)
        .map(([k]) => k)
    );
  }, [state]);

  // 모달에서 보여줄 데이터
  const viewing = useMemo(() => {
    if (!viewingQuestionId || !state) return null;
    const entry = state.answers.find(
      (a) => a.questionId === viewingQuestionId
    );
    return {
      questionId: viewingQuestionId,
      summary: state.summaries[viewingQuestionId],
      rawAnswers: entry?.answers ?? [],
      generating: summarizingIds.has(viewingQuestionId),
    };
  }, [viewingQuestionId, state, summarizingIds]);

  if (!state) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-zinc-500">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <MilestoneSidebar
        currentQuestionId={state.currentQuestionId}
        isComplete={state.isComplete}
        answeredIds={answeredIds}
        summaryIds={summaryIds}
        onSelect={(qid) => setViewingQuestionId(qid)}
        onReset={handleReset}
      />

      <main className="flex flex-1 flex-col">
        <ChatMessages messages={state.messages} loading={loading} />

        {state.isComplete && (
          <FinalDraft
            draft={state.draft ?? ""}
            loading={draftLoading}
            error={error}
            onRegenerate={generateDraft}
          />
        )}

        {!state.isComplete && (
          <>
            {error && (
              <div className="mx-auto w-full max-w-3xl px-4">
                <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              </div>
            )}
            <ChatInput
              loading={loading}
              disabled={state.isComplete}
              onSend={handleSend}
            />
          </>
        )}
      </main>

      {viewing && (
        <SummaryModal
          questionId={viewing.questionId}
          summary={viewing.summary}
          rawAnswers={viewing.rawAnswers}
          generating={viewing.generating}
          onClose={() => setViewingQuestionId(null)}
          onRegenerate={() => generateSummary(viewing.questionId)}
        />
      )}
    </div>
  );
}
