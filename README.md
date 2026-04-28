# 연구 사업계획서 작성 서포트 챗봇 (easy-chat)

대화를 통해 연구 사업계획서 초안을 함께 정리해주는 PWA 채팅 서비스.

## 핵심 동작

1. 사이드바에 11개 질문(🟦 A 4개 / 🟨 B 3개 / 🟩 C 4개)이 마일스톤으로 표시됩니다.
2. AI는 따뜻한 짧은 오프닝 후, 현재 단계의 질문을 자연스럽게 던집니다.
3. 사용자의 답변이 충분치 않으면 같은 단계 안에서 0~2회까지 부드러운 꼬리질문으로 보조합니다.
4. 모든 질문이 끝나면, 사용자가 실제로 사용한 단어를 중심으로 사업계획서 초안을 생성하고 복사 버튼을 제공합니다.
5. 대화·답변은 **localStorage** 에만 저장됩니다 (별도 클라우드 DB 없음). "대화 초기화" 버튼으로 즉시 삭제 가능.

## 기술 스택

- **Next.js 15 (App Router) + React 19 + TypeScript**
- **Tailwind CSS**
- **Google GenAI SDK (`@google/genai`)** — Gemini 2.5 Flash 기본 (`GEMINI_MODEL` 로 변경 가능)
- 배포: **Vercel** (제로 설정)

## 토큰 절감 설계

- 매 요청에서 모델에 전달되는 컨텍스트는 (시스템 프롬프트 + 최근 8턴 + 현재 단계 누적 답변)으로 슬림화
- 전체 대화 로그는 클라이언트(localStorage)에만 보관
- 모델 응답 끝의 `<meta>{...}</meta>` 태그로 진행 제어 (advance / followupCount / isComplete)
- 별도의 자동 만료 타이머는 두지 않음 (사용자 수동 초기화)

## 실행 방법

### 1) Gemini API 키 발급

1. https://aistudio.google.com/app/apikey 접속 (Google 계정 로그인)
2. **Create API key** 클릭
3. 생성된 키(예: `AIzaSy...`) 복사

> Gemini API에는 **무료 티어**가 있어서 분당/일별 제한 안에선 비용이 발생하지 않습니다. 트래픽이 늘면 프로젝트에 결제 정보를 등록해 유료(Paid) 티어로 전환할 수 있습니다.

### 2) 프로젝트 셋업

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 을 열고 GEMINI_API_KEY=AIza... 입력

# 개발 서버
npm run dev
# http://localhost:3000
```

### 3) Vercel 배포

1. GitHub 에 푸시.
2. Vercel 에서 import.
3. **Environment Variables** 에 `GEMINI_API_KEY` 등록.
4. 빌드 명령은 기본값(`next build`) 그대로.

## 폴더 구조

```
easy-chat/
├─ app/
│  ├─ api/
│  │  ├─ chat/route.ts       # 대화 턴 처리 (Gemini 호출)
│  │  └─ draft/route.ts      # 최종 초안 생성
│  ├─ layout.tsx
│  ├─ page.tsx               # 메인 화면 (사이드바 + 채팅 + 초안)
│  └─ globals.css
├─ components/
│  ├─ MilestoneSidebar.tsx
│  ├─ ChatMessages.tsx
│  ├─ ChatInput.tsx
│  └─ FinalDraft.tsx
├─ lib/
│  ├─ questions.ts           # 11개 질문 정의 (단일 소스)
│  ├─ prompts.ts             # 시스템 프롬프트 빌더
│  ├─ gemini.ts              # Google GenAI 클라이언트 + meta 파서
│  └─ storage.ts             # localStorage 헬퍼
├─ types/index.ts
├─ public/manifest.json
└─ ...설정 파일
```

## 대화 톤·태도

`lib/prompts.ts` 의 `CONVERSATION_RULES` 에 사용자가 정의한 MI/OARS 기반 규칙이 그대로 들어가 있습니다. 톤을 조정하려면 이 상수만 수정하세요.

## 초안 작성 원칙

`buildDraftSystemPrompt` 가 다음을 모델에 강제합니다.

- 사용자가 실제로 말한 단어·표현을 중심으로 사용
- 사용자가 쓰지 않은 사실·수치·기관명 등 **임의 생성 금지**
- 부족한 항목은 `(추가 확인 필요)` 표기
- 정해진 섹션 구조 (1-1 ~ 3-4) 준수

## 비용 참고

- **Gemini 2.5 Flash (Paid Tier)**: 입력 약 $0.30 / 1M 토큰, 출력 약 $2.50 / 1M 토큰
- 한 세션(대화 11문항 + 초안 생성) 평균 토큰 사용량을 감안하면 세션당 약 **2~5센트** 수준
- 무료 티어 한도 안이면 비용 0
