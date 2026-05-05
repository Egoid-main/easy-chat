import { NextRequest, NextResponse } from "next/server";
import type { SummaryRequestBody, SummaryResponseBody } from "@/types";
import { getQuestionById } from "@/lib/questions";
import { buildSummarySystemPrompt } from "@/lib/prompts";
import { getGemini, DEFAULT_MODEL, logUsage } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: SummaryRequestBody;
  try {
    body = (await req.json()) as SummaryRequestBody;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 });
  }

  const q = getQuestionById(body.questionId);
  if (!q) {
    return NextResponse.json({ error: "알 수 없는 질문 ID" }, { status: 400 });
  }
  if (!Array.isArray(body.answers) || body.answers.length === 0) {
    return NextResponse.json(
      { error: "정리할 답변이 없습니다." },
      { status: 400 }
    );
  }

  const systemInstruction = buildSummarySystemPrompt(q, body.answers);

  try {
    const ai = getGemini();
    const startedAt = Date.now();
    const completion = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: "위 답변을 원칙대로 정리해 주세요." }],
        },
      ],
      config: {
        systemInstruction,
        // 테스트 기간: 실질 무제한. 평균 소비량 측정 후 다시 조정.
        maxOutputTokens: 2000,
        temperature: 0.3,
      },
    });

    const summary = (completion.text ?? "").trim();
    logUsage("summary", completion.usageMetadata, {
      model: DEFAULT_MODEL,
      ms: Date.now() - startedAt,
    });
    const res: SummaryResponseBody = { summary };
    return NextResponse.json(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "알 수 없는 오류";
    console.error("[/api/summary] error:", msg);
    return NextResponse.json(
      { error: `요약 생성 실패: ${msg}` },
      { status: 500 }
    );
  }
}
