import { NextRequest, NextResponse } from "next/server";
import type { ChatRequestBody, ChatResponseBody } from "@/types";
import { getQuestionById, getNextQuestion } from "@/lib/questions";
import { buildChatSystemPrompt } from "@/lib/prompts";
import {
  getGemini,
  DEFAULT_MODEL,
  extractMeta,
  toGeminiContents,
  logUsage,
} from "@/lib/gemini";

export const runtime = "nodejs"; // Google GenAI SDK 사용
export const dynamic = "force-dynamic";
export const maxDuration = 30; // Vercel: 모델 응답 지연 대비

/** 토큰 절감: 최근 N턴까지만 모델에 전달 */
const MAX_RECENT_MESSAGES = 8;

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 });
  }

  const { state, recentMessages, userMessage } = body;
  const current = getQuestionById(state.currentQuestionId);
  if (!current) {
    return NextResponse.json({ error: "알 수 없는 질문 ID" }, { status: 400 });
  }

  // 현재 질문에 대한 누적 답변
  const answersForCurrent =
    state.answers.find((a) => a.questionId === current.id)?.answers ?? [];

  const isFirstTurn =
    recentMessages.length === 0 && userMessage.trim().length === 0;

  const systemInstruction = buildChatSystemPrompt({
    current,
    followupCount: state.followupCount,
    answersForCurrent,
    isFirstTurn,
  });

  // 최근 N턴만 슬림하게 전달 (전체 로그는 클라이언트의 localStorage 에만 보관)
  const trimmed = recentMessages.slice(-MAX_RECENT_MESSAGES);

  const internal: { role: "user" | "assistant"; content: string }[] = [
    ...trimmed,
  ];

  // 첫 턴이면 사용자 메시지가 비어있을 수 있음 → 모델에게 오프닝 요청
  if (userMessage.trim().length > 0) {
    internal.push({ role: "user", content: userMessage });
  } else if (isFirstTurn) {
    internal.push({
      role: "user",
      content:
        "(시스템: 대화 시작입니다. 따뜻한 짧은 오프닝 후 첫 질문을 던져주세요.)",
    });
  }

  const contents = toGeminiContents(internal);

  try {
    const ai = getGemini();
    const startedAt = Date.now();
    const completion = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        // 테스트 기간: 실질 무제한. 평균 소비량 측정 후 다시 조정.
        maxOutputTokens: 4000,
        temperature: 0.7,
      },
    });

    const raw = (completion.text ?? "").trim();

    const { body: cleanBody, meta } = extractMeta(raw);

    // raw 가 </meta> 로 끝나지 않으면 응답이 잘렸을 가능성이 큼 → 로그에 표시
    const truncatedMetaTag = !/<\/meta>\s*$/i.test(raw);
    logUsage("chat", completion.usageMetadata, {
      model: DEFAULT_MODEL,
      ms: Date.now() - startedAt,
      truncatedMetaTag,
    });

    const advance = !!meta.advance;
    const isComplete = !!meta.isComplete;

    // followupCount 결정:
    // - advance=true 이면 다음 질문으로 가니까 0으로 리셋
    // - 그 외엔 모델이 보고한 값 사용 (없으면 +1)
    let followupCount = state.followupCount;
    if (advance) {
      followupCount = 0;
    } else if (typeof meta.followupCount === "number") {
      followupCount = Math.max(0, Math.min(2, meta.followupCount));
    } else {
      followupCount = Math.min(2, state.followupCount + 1);
    }

    // 다음 질문 ID 결정
    let nextQuestionId = current.id;
    if (advance) {
      const next = getNextQuestion(current.id);
      if (next) nextQuestionId = next.id;
    }

    const res: ChatResponseBody = {
      message: cleanBody,
      advance,
      followupCount,
      isComplete: isComplete || (advance && !getNextQuestion(current.id)),
      nextQuestionId,
    };

    return NextResponse.json(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "알 수 없는 오류";
    console.error("[/api/chat] error:", msg);
    return NextResponse.json(
      { error: `Gemini 호출 실패: ${msg}` },
      { status: 500 }
    );
  }
}
