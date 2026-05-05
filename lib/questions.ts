import type { Question } from "@/types";

/**
 * 사업계획서 작성용 질문 세트.
 * 사이드바 마일스톤과 시스템 프롬프트가 모두 이 단일 소스에서 파생된다.
 * 질문 id는 prompts.ts 의 최종 사업계획서 섹션 번호와 동일하게 매칭된다.
 */
export const QUESTIONS: Question[] = [
  // 🟦 Block 0 — 사업 아이템 개요
  {
    id: "0-1",
    block: "0",
    blockTitle: "사업 아이템 개요",
    index: 1,
    title: "팀명",
    hint: "부담 낮은 워밍업 질문. 팀 이름과 그 안에 담긴 의미·정체성을 함께 듣되, 너무 깊게 캐묻지는 않는다.",
  },
  {
    id: "0-2",
    block: "0",
    blockTitle: "사업 아이템 개요",
    index: 2,
    title: "아이템 한 줄 소개",
    hint: "사업 아이템을 한 문장으로 표현하도록 돕는다. 누구에게·무엇을·어떻게 제공하는지가 한 문장에 들어오면 좋다.",
  },
  {
    id: "0-3",
    block: "0",
    blockTitle: "사업 아이템 개요",
    index: 3,
    title: "창업 목표",
    hint: "본 사업을 통해 달성하고 싶은 궁극적인 목표 한 줄. 단기 매출보다 어디로 가고 싶은지의 방향성에 가깝다.",
  },

  // 🟨 Block 1 — 문제 인식
  {
    id: "1-1",
    block: "1",
    blockTitle: "문제 인식",
    index: 1,
    title: "창업 배경 및 개발 동기",
    hint: "왜 이 사업을 시작하게 되었는지, 제품·서비스를 개발·보유하게 된 개인적·환경적 맥락.",
  },
  {
    id: "1-2",
    block: "1",
    blockTitle: "문제 인식",
    index: 2,
    title: "창업아이템의 목적 및 필요성",
    hint: "어떤 문제에 착안했는지, 그 문제를 누가 겪고 있는지, 아이템의 목적·필요성·해결방안.",
  },
  {
    id: "1-3",
    block: "1",
    blockTitle: "문제 인식",
    index: 3,
    title: "창업아이템의 목표시장 분석",
    hint: "진출하려는 목표시장의 규모·상황·특성, 경쟁 강도, 성장성, 고객 특성. 임의 수치가 아니라 사용자가 실제로 본 근거 위주로 듣는다.",
  },

  // 🟩 Block 2 — 실현가능성
  {
    id: "2-1",
    block: "2",
    blockTitle: "실현가능성",
    index: 1,
    title: "사업화 전략",
    hint: "제품·서비스 및 BM(BMC)의 구현 정도, 개발(제작) 기간·방법, 추진 일정, 전체 로드맵, 구체적 실현 방안.",
  },
  {
    id: "2-2",
    block: "2",
    blockTitle: "실현가능성",
    index: 2,
    title: "시장분석 및 경쟁력 확보 방안",
    hint: "시장 수요·경쟁제품 분석 근거, 자사 제품·서비스의 우위 요소·차별화 전략, 경쟁력 확보 방안.",
  },

  // 🟪 Block 3 — 성장 전략
  {
    id: "3-1",
    block: "3",
    blockTitle: "성장 전략",
    index: 1,
    title: "시장진입 및 성과창출 전략",
    hint: "내수/글로벌 시장진출 또는 확장을 위한 포지셔닝과 판매 전략(유통채널·시기·판매금액). 예비/기창업 단계에 따라 강조점이 달라진다.",
  },
  {
    id: "3-2",
    block: "3",
    blockTitle: "성장 전략",
    index: 2,
    title: "자금조달 계획",
    hint: "사업화 단계별(과거·현재·미래) 소요 자금 산출 및 투입 계획의 구체성.",
  },

  // 🟧 Block 4 — 팀 구성
  {
    id: "4-1",
    block: "4",
    blockTitle: "팀 구성",
    index: 1,
    title: "창업자의 역량",
    hint: "창업자 본인의 역량, 도전정신·기업가정신, 사업화와 관련해 보유한 전문성(기술력·노하우).",
  },
  {
    id: "4-2",
    block: "4",
    blockTitle: "팀 구성",
    index: 2,
    title: "팀 구성원 소개 및 역량",
    hint: "팀 구성원의 담당업무, 사업화와 관련해 보유한 전문성(기술력·노하우). 1인 창업이면 해당 사항을 그대로 두고 넘어간다.",
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
