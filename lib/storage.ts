import type { ChatState } from "@/types";
import { FIRST_QUESTION_ID } from "./questions";

const STORAGE_KEY = "easy-chat:state:v1";
const STATE_VERSION = 2;

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
    // 누락된 필드를 안전하게 보강 (구버전 → 신버전 마이그레이션)
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
