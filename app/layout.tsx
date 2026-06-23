import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import RecoilProvider from "@/components/RecoilProvider";
import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });

const pretendard = localFont({
  src: [
    { path: "../public/fonts/Pretendard-Thin.woff2", weight: "100" },
    { path: "../public/fonts/Pretendard-ExtraLight.woff2", weight: "200" },
    { path: "../public/fonts/Pretendard-Light.woff2", weight: "300" },
    { path: "../public/fonts/Pretendard-Regular.woff2", weight: "400" },
    { path: "../public/fonts/Pretendard-Medium.woff2", weight: "500" },
    { path: "../public/fonts/Pretendard-SemiBold.woff2", weight: "600" },
    { path: "../public/fonts/Pretendard-Bold.woff2", weight: "700" },
    { path: "../public/fonts/Pretendard-ExtraBold.woff2", weight: "800" },
    { path: "../public/fonts/Pretendard-Black.woff2", weight: "900" },
  ],
  display: "swap",
  variable: "--font-pretendard",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#166534",
};

export const metadata: Metadata = {
  title: "몽골 선교 2026",
  description: "몽골 선교 2026 기도편지 함께 기도해 주세요 🙏",
  metadataBase: new URL("https://mongolia-employment.vercel.app"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "몽골선교",
  },
  openGraph: {
    title: "몽골 선교 2026",
    description: "몽골 선교 2026 기도편지 함께 기도해 주세요",
    images: [{ url: "/images/thumbnail2.webp", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full ${pretendard.variable}`}>
      <head>
        {/* apple-touch-icon과 mobile-web-app-capable은 Next.js metadata API로 제어 불가 */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      {/*
        모바일: body 전체가 앱
        데스크탑: 왼쪽 장식 패널 + 오른쪽 390px 앱 패널 (flex)
      */}
      <body className="h-full lg:flex lg:overflow-hidden lg:relative">
        {/* ── 전체화면 고정 배경 이미지 (모바일 + 데스크탑 공통) ── */}
        <div className="fixed inset-0 -z-10 lg:hidden">
          <Image
            src="/images/bg.webp"
            alt=""
            fill
            className="object-cover object-center"
            quality={90}
            priority
          />
        </div>

        <RecoilProvider>

          {/* ── 왼쪽 장식 패널 (데스크탑 전용) ── */}
          <div className="hidden lg:block flex-1 relative overflow-hidden select-none">

            {/* 배경 이미지 */}
            <Image
              src="/images/bg.webp"
              alt=""
              fill
              className="object-cover object-center"
              quality={100}
              sizes="(min-width: 1024px) calc(100vw - 390px), 0px"
              priority
            />

            {/* 링 + 콘텐츠 공통 래퍼 — 같은 중심점 공유 */}
            <div className="absolute top-1/2 left-86 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[380px]">

{/* 텍스트 콘텐츠 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                <p className="text-sm font-semibold tracking-[0.2em] mb-3 uppercase" style={{
                  color: "#FCDD4F",
                  textShadow: "1px 1px 0 black",
                }}>
                  2026 Mongolia Mission Trip
                </p>
                <h1
                  className={`${playfair.className} text-5xl leading-tight mb-6 tracking-tight uppercase`}
                  style={{
                    color: "#FCDD4F",
                    textShadow: "1px 1px 0 black",
                  }}
                >
                  God So Loved<br />The World
                </h1>
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-px w-10 opacity-50" style={{ background: "#FCDD4F" }} />
                  <div className="w-1 h-1 rotate-45 opacity-70" style={{ background: "#FCDD4F" }} />
                  <div className="h-px w-10 opacity-50" style={{ background: "#FCDD4F" }} />
                </div>
                <p className="text-base font-bold mb-2 tracking-widest" style={{
                  color: "#FCDD4F",
                  textShadow: "1px 1px 0 black",
                }}>JOHN 3:16</p>
                <p className="text-base leading-relaxed max-w-[300px]" style={{ color: "rgba(252,221,79,0.9)", textShadow: "1px 1px 0 black" }}>
                  For God so loved the world that he gave his one and only Son,
                  that whoever believes in him shall not perish but have eternal life.
                </p>
                <p className="text-base mt-5 tracking-wider" style={{ color: "rgba(252,221,79,1)", textShadow: "1px 1px 0 black" }}>2026.06.28 – 07.04</p>
              </div>

            </div>
          </div>

          {/* ── 오른쪽 앱 패널 ── */}
          {/*
            모바일: w-full, 일반 스크롤
            데스크탑: w-[390px] 고정, h-screen 내부 스크롤, BottomNav 하단 고정
          */}
          <div className="w-full lg:absolute lg:right-[190px] lg:top-0 lg:w-[390px] lg:h-screen lg:flex lg:flex-col lg:z-10 lg:[backdrop-filter:blur(2px)]">
            <div className="flex-1 lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
              <main className="lg:pb-0">{children}</main>
            </div>
            <BottomNav />
          </div>

        </RecoilProvider>
        {/* Service Worker 등록 — load 이벤트 후 실행해 초기 로드 성능에 영향 없게 함 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(e){console.error('SW 등록 실패:',e);})})}`,
          }}
        />
      </body>
    </html>
  );
}
