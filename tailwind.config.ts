import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        block0: "#3b82f6", // 파랑 — 사업 아이템 개요
        block1: "#eab308", // 노랑 — 문제 인식
        block2: "#22c55e", // 초록 — 실현가능성
        block3: "#a855f7", // 보라 — 성장 전략
        block4: "#f97316", // 주황 — 팀 구성
      },
    },
  },
  plugins: [],
};

export default config;
