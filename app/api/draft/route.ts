import { NextRequest, NextResponse } from "next/server";
import type { DraftRequestBody, DraftResponseBody } from "@/types";
import { buildDraftSystemPrompt } from "@/lib/prompts";
import { getGemini, DEFAULT_MODEL } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 초안은 가장 길어서 여유있게

export async function POST(req: NextRequest) {
  let body: DraftRequestBody;
  try {
    body = (await req.json()) as DraftRequestBody;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 });
  }

  if (!Array.isArray(body.answers) || body.answers.length === 0) {
    return NextResponse.json(
      { error: "정리할 답변이 없습니다." },
      { status: 400 }
    );
  }

  const systemInstruction = buildDraftSystemPrompt(body.answers);

  try {
    const ai = getGemini();
    const completion = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "위 원본만 사용해 사업계획서 초안을 마크다운으로 정리해 주세요.",
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        maxOutputTokens: 2000,
        temperature: 0.4,
      },
    });

    const draft = (completion.text ?? "").trim();
    const res: DraftResponseBody = { draft };
    return NextResponse.json(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "알 수 없는 오류";
    console.error("[/api/draft] error:", msg);
    return NextResponse.json(
      { error: `초안 생성 실패: ${msg}` },
      { status: 500 }
    );
  }
}
