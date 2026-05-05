import type { ChatState } from "@/types";
import { FIRST_QUESTION_ID } from "./questions";

const STORAGE_KEY = "easy-chat:state:v1";
// v3: 연구 → 사업계획서로 질문 세트 전면 교체. 구버전 state는 자동 초기화된다.
const STATE_VERSION = 3;

export function createInitialState(): ChatState {
  const now = Date.now();
  return {
    version: STATE_VERSION,
    currentQuestionId: FIRST_QUESTION_ID,
    followupCount: 0,
    isComplete: false,
    messages: [],
    answers: [],
    summaries: {},
    startedAt: now,
    updatedAt: now,
  };
}

export function loadState(): ChatState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<ChatState>;
    // 버전 불일치 → 질문 세트가 바뀐 상황이므로 깨끗하게 새로 시작.
    if (parsed.version !== STATE_VERSION) {
      return createInitialState();
    }
    // 누락된 필드를 안전하게 보강
    return {
      ...createInitialState(),
      ...parsed,
      summaries: parsed.summaries ?? {},
      version: STATE_VERSION,
    };
  } catch {
    return createInitialState();
  }
}

export function saveState(state: ChatState): void {
  if (typeof window === "undefined") return;
  try {
    const next: ChatState = { ...state, updatedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota / private mode 등은 조용히 무시
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
}

export function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
