/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  StaleWhileRevalidate,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const DYNAMIC_PAGES = [
  "/prayer-letters",
  "/guide",
  "/qt",
  "/phrasebook",
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
  runtimeCaching: [
    // Next.js RSC 페이로드 (?_rsc=): 클라이언트 사이드 네비게이션 시 발생
    // HTML 대신 JSON 페이로드를 fetch로 요청하므로 별도 캐시 필요
    {
      matcher: ({ url }) => url.searchParams.has("_rsc"),
      handler: new NetworkFirst({
        cacheName: "rsc-payloads",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 60 * 60 * 24,
          }),
        ],
      }),
    },

    // force-dynamic 페이지: NetworkFirst (5초 타임아웃 후 캐시 폴백)
    {
      matcher: ({ url }) =>
        DYNAMIC_PAGES.some(
          (p) => url.pathname === p || url.pathname.startsWith(p + "/")
        ),
      handler: new NetworkFirst({
        cacheName: "dynamic-pages",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24,
          }),
        ],
      }),
    },

    // 정적 페이지 HTML: StaleWhileRevalidate
    {
      matcher: ({ request }) => request.destination === "document",
      handler: new StaleWhileRevalidate({
        cacheName: "pages",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24,
          }),
        ],
      }),
    },

    // Next.js JS/CSS 번들 (콘텐츠 해시 포함, 불변): CacheFirst 365일
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({
        cacheName: "next-static-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          }),
        ],
      }),
    },

    // 기도편지 이미지 (31개 WebP): CacheFirst 30일
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/images/prayer-letters/"),
      handler: new CacheFirst({
        cacheName: "prayer-letter-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 40,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          }),
        ],
      }),
    },

    // 배경 이미지 등 기타 정적 이미지: CacheFirst 30일
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/images/") &&
        !url.pathname.startsWith("/images/prayer-letters/"),
      handler: new CacheFirst({
        cacheName: "static-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          }),
        ],
      }),
    },

    // 전도 구문집 오디오 (mp3/m4a): CacheFirst 30일
    // new Audio(src) 호출도 fetch 요청을 발생시키므로 SW가 인터셉트해 오프라인 재생 가능
    {
      matcher: ({ url }) => url.pathname.startsWith("/audio/"),
      handler: new CacheFirst({
        cacheName: "phrasebook-audio",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 40,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          }),
        ],
      }),
    },

    // 기도 하트 수 API (GET): StaleWhileRevalidate 5분
    {
      matcher: ({ url, request }) =>
        url.pathname === "/api/prayer-count" && request.method === "GET",
      handler: new StaleWhileRevalidate({
        cacheName: "api-prayer-count",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 1,
            maxAgeSeconds: 60 * 5,
          }),
        ],
      }),
    },

    // QT 디브리핑 API (GET): NetworkFirst 4초 타임아웃
    {
      matcher: ({ url, request }) =>
        url.pathname === "/api/qt-debriefing" && request.method === "GET",
      handler: new NetworkFirst({
        cacheName: "api-qt-debriefing",
        networkTimeoutSeconds: 4,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 60 * 60,
          }),
        ],
      }),
    },

    // Google Fonts (Playfair Display): 기본 CacheFirst
    ...defaultCache,
  ],
});

serwist.addEventListeners();
