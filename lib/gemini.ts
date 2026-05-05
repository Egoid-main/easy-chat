import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다. .env.local 을 확인하세요."
    );
  }
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

/** 비용 최적화 기본 모델. 환경변수로 오버라이드 가능. */
export const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

/** 내부 메시지 포맷 → Gemini contents 포맷 변환. */
export function toGeminiContents(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

/** "<meta>{...}</meta>" 태그를 본문에서 분리한다. */
export function extractMeta(raw: string): {
  body: string;
  meta: { advance?: boolean; followupCount?: number; isComplete?: boolean };
} {
  const re = /<meta>\s*(\{[\s\S]*?\})\s*<\/meta>\s*$/i;
  const m = raw.match(re);
  if (!m) return { body: raw.trim(), meta: {} };
  const body = raw.replace(re, "").trim();
  try {
    const meta = JSON.parse(m[1]);
    return { body, meta };
  } catch {
    return { body, meta: {} };
  }
}

/**
 * Gemini 응답의 usageMetadata 를 Vercel 로그용 한 줄 JSON 으로 기록한다.
 * 테스트 기간 동안 라우트별 평균 토큰 소비량을 측정하기 위함.
 *
 * 검색 팁: Vercel Logs 에서 `[usage]` 로 grep.
 *
 * 필드:
 *  - prompt: 입력(시스템 프롬프트 + 컨텍스트) 토큰
 *  - candidates: 사용자에게 보이는 출력 토큰
 *  - thoughts: Gemini 2.5 thinking 토큰 (가시 출력 X, 비용 발생 O)
 *  - total: 위 합계 (모델이 직접 보고)
 *  - cached: 컨텍스트 캐시 적중 토큰 (있을 때만)
 *  - ms: 호출 소요 시간
 */
export function logUsage(
  route: "chat" | "summary" | "draft",
  // 어떤 SDK 버전이든 안전하게 받기 위해 unknown 으로 받음
  usageMetadata: unknown,
  extra: { model: string; ms: number; truncatedMetaTag?: boolean }
): void {
  const u = (usageMetadata ?? {}) as Record<string, number | undefined>;
  const payload = {
    route,
    model: extra.model,
    prompt: u.promptTokenCount ?? 0,
    candidates: u.candidatesTokenCount ?? 0,
    thoughts: u.thoughtsTokenCount ?? 0,
    total: u.totalTokenCount ?? 0,
    cached: u.cachedContentTokenCount ?? 0,
    ms: extra.ms,
    ...(extra.truncatedMetaTag ? { truncatedMetaTag: true } : {}),
  };
  // 한 줄 JSON 으로 출력해야 Vercel Logs 에서 파싱이 쉬움
  console.log(`[usage] ${JSON.stringify(payload)}`);
}
