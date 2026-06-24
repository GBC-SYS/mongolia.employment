import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// 빌드마다 고유한 revision을 생성해 SW가 파일 변경을 정확히 감지하게 함
// "v1" 고정 문자열은 파일 내용이 바뀌어도 SW가 재다운로드하지 않는 버그 유발
const BUILD_REVISION = Date.now().toString();

const withSerwist = withSerwistInit({
  swSrc: "public/sw.ts",
  swDest: "public/sw.js",
  // dev 환경에서 SW 활성화 시 HMR WebSocket이 인터셉트되어 핫리로드가 망가짐
  disable: process.env.NODE_ENV === "development",
  exclude: [/\.DS_Store/],
  additionalPrecacheEntries: [
    // 오프라인 폴백 페이지
    { url: "/offline", revision: BUILD_REVISION },
    // 배경 이미지
    { url: "/images/bg.webp", revision: BUILD_REVISION },
    // 기도편지 이미지 31개
    ...Array.from({ length: 31 }, (_, i) => ({
      url: `/images/prayer-letters/${String(i + 1).padStart(3, "0")}.webp`,
      revision: BUILD_REVISION,
    })),
    // 기도편지 상세 페이지 HTML 31개 — SW 설치 시 미방문 상태에서도 오프라인 접근 가능
    ...Array.from({ length: 31 }, (_, i) => ({
      url: `/prayer-letters/${String(i + 1).padStart(3, "0")}`,
      revision: BUILD_REVISION,
    })),
    // 전도 구문집 오디오 — blessing (6개)
    ...Array.from({ length: 6 }, (_, i) => ({
      url: `/audio/phrasebook/blessing_${i}.mp3`,
      revision: BUILD_REVISION,
    })),
    // gospel (10개)
    ...Array.from({ length: 10 }, (_, i) => ({
      url: `/audio/phrasebook/gospel_${i}.mp3`,
      revision: BUILD_REVISION,
    })),
    // confession m4a (3개)
    { url: "/audio/phrasebook/confession_0.m4a", revision: BUILD_REVISION },
    { url: "/audio/phrasebook/confession_1.m4a", revision: BUILD_REVISION },
    { url: "/audio/phrasebook/confession_2.m4a", revision: BUILD_REVISION },
    // confession mp3 (4개) — confession_3은 존재하지 않음 (파일 미생성, 의도적 누락)
    { url: "/audio/phrasebook/confession_4.mp3", revision: BUILD_REVISION },
    { url: "/audio/phrasebook/confession_5.mp3", revision: BUILD_REVISION },
    { url: "/audio/phrasebook/confession_6.mp3", revision: BUILD_REVISION },
    { url: "/audio/phrasebook/confession_7.mp3", revision: BUILD_REVISION },
    // vocab (5개)
    { url: "/audio/phrasebook/vocab_cross.mp3", revision: BUILD_REVISION },
    { url: "/audio/phrasebook/vocab_god.mp3", revision: BUILD_REVISION },
    { url: "/audio/phrasebook/vocab_heaven.mp3", revision: BUILD_REVISION },
    { url: "/audio/phrasebook/vocab_savior.mp3", revision: BUILD_REVISION },
    { url: "/audio/phrasebook/vocab_sin.mp3", revision: BUILD_REVISION },
  ],
});

const nextConfig: NextConfig = {
  // Next.js 16에서 @serwist/next webpack 주입 시 turbopack 설정 누락 에러 방지용
  // next build는 webpack 사용, next dev만 Turbopack 적용됨
  turbopack: {},
  outputFileTracingIncludes: {
    "/api/thumbnail/[id]": ["./public/images/prayer-letters/**"],
  },
};

export default withSerwist(nextConfig);
