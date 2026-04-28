import type { Question } from "@/types";

/**
 * 연구 사업계획서 작성용 질문 세트.
 * 사이드바 마일스톤과 시스템 프롬프트가 모두 이 단일 소스에서 파생된다.
 */
export const QUESTIONS: Question[] = [
  // 🟦 Block A — 연구의 정의 (What·Why)
  {
    id: "A1",
    block: "A",
    blockTitle: "연구의 정의 (What·Why)",
    index: 1,
    title: "연구 아이템 한 줄 소개",
    hint: "연구하려는 아이템·주제를 한 문장으로 표현하도록 돕는다.",
  },
  {
    id: "A2",
    block: "A",
    blockTitle: "연구의 정의 (What·Why)",
    index: 2,
    title: "연구 목표",
    hint: "이 연구를 통해 도달하려는 구체적 목표.",
  },
  {
    id: "A3",
    block: "A",
    blockTitle: "연구의 정의 (What·Why)",
    index: 3,
    title: "연구 배경 및 개발 동기",
    hint: "왜 이 연구를 시작하게 되었는지, 어떤 맥락이 있는지.",
  },
  {
    id: "A4",
    block: "A",
    blockTitle: "연구의 정의 (What·Why)",
    index: 4,
    title: "연구의 목적 및 필요성",
    hint: "이 연구가 왜 지금 필요한지, 무엇을 해결하는지.",
  },

  // 🟨 Block B — 연구의 외부 정당성
  {
    id: "B1",
    block: "B",
    blockTitle: "연구의 외부 정당성",
    index: 1,
    title: "연구 대상 분야 동향",
    hint: "관련 분야의 흐름·시장·기술적 변화.",
  },
  {
    id: "B2",
    block: "B",
    blockTitle: "연구의 외부 정당성",
    index: 2,
    title: "기존 연구·서비스와의 차별점",
    hint: "이미 존재하는 것과 무엇이 어떻게 다른지.",
  },
  {
    id: "B3",
    block: "B",
    blockTitle: "연구의 외부 정당성",
    index: 3,
    title: "연구 결과 활용 방안",
    hint: "결과물이 어디에·누구에게·어떻게 쓰일 수 있는지.",
  },

  // 🟩 Block C — 연구의 실행 계획 (How·Who)
  {
    id: "C1",
    block: "C",
    blockTitle: "연구의 실행 계획 (How·Who)",
    index: 1,
    title: "연구 자원 및 도구, 분석 계획",
    hint: "필요한 자원·도구·방법론·분석 흐름.",
  },
  {
    id: "C2",
    block: "C",
    blockTitle: "연구의 실행 계획 (How·Who)",
    index: 2,
    title: "연구자의 역량",
    hint: "연구자의 배경·강점·이 연구를 수행할 수 있는 근거.",
  },
  {
    id: "C3",
    block: "C",
    blockTitle: "연구의 실행 계획 (How·Who)",
    index: 3,
    title: "피험자 페르소나 및 특성",
    hint: "연구 대상자의 인구통계·경험·맥락.",
  },
  {
    id: "C4",
    block: "C",
    blockTitle: "연구의 실행 계획 (How·Who)",
    index: 4,
    title: "레퍼런스",
    hint: "참고한 선행연구·자료·인용 가능 출처.",
  },
];

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function getNextQuestion(currentId: string): Question | undefined {
  const idx = QUESTIONS.findIndex((q) => q.id === currentId);
  if (idx === -1 || idx === QUESTIONS.length - 1) return undefined;
  return QUESTIONS[idx + 1];
}

export const FIRST_QUESTION_ID = QUESTIONS[0].id;
export const LAST_QUESTION_ID = QUESTIONS[QUESTIONS.length - 1].id;
