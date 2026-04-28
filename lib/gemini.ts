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
