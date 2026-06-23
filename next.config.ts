import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "public/sw.ts",
  swDest: "public/sw.js",
  // dev 환경에서 SW 활성화 시 HMR WebSocket이 인터셉트되어 핫리로드가 망가짐
  disable: process.env.NODE_ENV === "development",
  exclude: [/\.DS_Store/],
  additionalPrecacheEntries: [
    // 오프라인 폴백 페이지
    { url: "/offline", revision: "v1" },
    // 배경 이미지
    { url: "/images/bg.webp", revision: "v1" },
    // 기도편지 이미지 31개
    ...Array.from({ length: 31 }, (_, i) => ({
      url: `/images/prayer-letters/${String(i + 1).padStart(3, "0")}.webp`,
      revision: "v1",
    })),
    // 전도 구문집 오디오 — blessing (6개)
    ...Array.from({ length: 6 }, (_, i) => ({
      url: `/audio/phrasebook/blessing_${i}.mp3`,
      revision: "v1",
    })),
    // gospel (10개)
    ...Array.from({ length: 10 }, (_, i) => ({
      url: `/audio/phrasebook/gospel_${i}.mp3`,
      revision: "v1",
    })),
    // confession m4a (3개)
    { url: "/audio/phrasebook/confession_0.m4a", revision: "v1" },
    { url: "/audio/phrasebook/confession_1.m4a", revision: "v1" },
    { url: "/audio/phrasebook/confession_2.m4a", revision: "v1" },
    // confession mp3 (4개) — confession_3은 존재하지 않음 (파일 미생성, 의도적 누락)
    { url: "/audio/phrasebook/confession_4.mp3", revision: "v1" },
    { url: "/audio/phrasebook/confession_5.mp3", revision: "v1" },
    { url: "/audio/phrasebook/confession_6.mp3", revision: "v1" },
    { url: "/audio/phrasebook/confession_7.mp3", revision: "v1" },
    // vocab (5개)
    { url: "/audio/phrasebook/vocab_cross.mp3", revision: "v1" },
    { url: "/audio/phrasebook/vocab_god.mp3", revision: "v1" },
    { url: "/audio/phrasebook/vocab_heaven.mp3", revision: "v1" },
    { url: "/audio/phrasebook/vocab_savior.mp3", revision: "v1" },
    { url: "/audio/phrasebook/vocab_sin.mp3", revision: "v1" },
  ],
});

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/thumbnail/[id]": ["./public/images/prayer-letters/**"],
  },
};

export default withSerwist(nextConfig);
