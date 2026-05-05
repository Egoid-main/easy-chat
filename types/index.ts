export type BlockId = "0" | "1" | "2" | "3" | "4";

export interface Question {
  id: string;            // 예: "0-1", "1-2", "4-2"
  block: BlockId;
  blockTitle: string;    // 예: "사업 아이템 개요"
  index: number;         // 블록 내 순서 (1-based)
  title: string;         // 예: "팀명"
  hint?: string;         // 모델에게 줄 보조 설명 (UI에는 노출 안 함)
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  questionId?: string;   // 어떤 질문에 대한 응답·질문이었는지
  createdAt: number;
}

/** 질문별 사용자 답변 모음. 동일 질문에 대해 꼬리질문이 있으면 누적된다. */
export interface AnswerEntry {
  questionId: string;
  answers: string[];     // 사용자 발화 그대로 (단어 보존용)
}

export interface ChatState {
  version: number;
  currentQuestionId: string;          // 현재 진행 중인 질문 (마일스톤 표시용)
  followupCount: number;              // 현재 질문에서 사용된 꼬리질문 수 (0~2)
  isComplete: boolean;                // 모든 질문이 끝났는지
  messages: ChatMessage[];            // 전체 대화 로그 (UI용)
  answers: AnswerEntry[];             // 질문별 누적 답변
  /** 질문 ID → 짧게 정리된 요약 (사이드바 클릭 시 표시) */
  summaries: Record<string, string>;
  draft?: string;                     // 최종 사업계획서 초안
  startedAt: number;
  updatedAt: number;
}

/** /api/chat 요청 바디 */
export interface ChatRequestBody {
  state: Pick<ChatState, "currentQuestionId" | "followupCount" | "answers">;
  /** 모델에 보낼 최근 대화 (토큰 절감 위해 슬림하게) */
  recentMessages: { role: "user" | "assistant"; content: string }[];
  /** 이번 턴의 사용자 발화 */
  userMessage: string;
}

/** /api/chat 응답 */
export interface ChatResponseBody {
  message: string;        // 사용자에게 보여줄 본문 (meta 제거됨)
  advance: boolean;       // 다음 질문으로 넘어가도 되는지
  followupCount: number;  // 다음 턴 기준 꼬리질문 카운트
  isComplete: boolean;    // 모든 질문이 끝났는지
  nextQuestionId: string; // advance 반영된 다음 질문 ID (그대로면 동일)
}

/** /api/draft 요청 바디 */
export interface DraftRequestBody {
  answers: AnswerEntry[];
}

/** /api/draft 응답 */
export interface DraftResponseBody {
  draft: string;
}

/** /api/summary 요청 바디 */
export interface SummaryRequestBody {
  questionId: string;
  answers: string[];
}

/** /api/summary 응답 */
export interface SummaryResponseBody {
  summary: string;
}
