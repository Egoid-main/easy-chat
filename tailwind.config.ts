import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blockA: "#3b82f6", // 파랑
        blockB: "#eab308", // 노랑
        blockC: "#22c55e", // 초록
      },
    },
  },
  plugins: [],
};

export default config;
