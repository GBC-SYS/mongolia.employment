import type { Metadata } from "next";
import "./globals.css";
import AppBackground from "@/components/AppBackground";
import AppPanel from "@/components/AppPanel";
import BottomNav from "@/components/BottomNav";
import DesktopHero from "@/components/DesktopHero";
import MusicPlayerDock from "@/components/MusicPlayerDock";
import RecoilProvider from "@/components/RecoilProvider";
import localFont from "next/font/local";

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
        {/* ── 전체화면 고정 배경 이미지 (모바일 공통, /photos는 데스크탑에서도 표시) ── */}
        <AppBackground />

        <RecoilProvider>

          {/* ── 왼쪽 장식 패널 (데스크탑 전용, /photos에서는 숨김) ── */}
          <DesktopHero />

          {/* ── 오른쪽 앱 패널 ── */}
          {/*
            모바일: w-full, 일반 스크롤
            데스크탑: w-[390px] 고정, h-screen 내부 스크롤, BottomNav 하단 고정
            (/photos는 왼쪽 패널이 없으므로 폰 프레임 배치 대신 전체 화면을 채움 — AppPanel 참고)
          */}
          {/* #app-panel: absolute로 배치되어 containing block 역할 수행 */}
          {/* ConfirmDialog는 이 엘리먼트에 createPortal하여 lg:absolute inset-0 전략으로 패널 내부에 렌더링 */}
          <AppPanel>
            <div className="flex-1 lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
              <main className="lg:pb-0">{children}</main>
            </div>

            <BottomNav />
          </AppPanel>

        </RecoilProvider>

        {/*
          전역 고정 뮤직 플레이어 — RecoilProvider 밖, body 바로 아래에 배치.
          #app-panel은 lg 브레이크포인트에서 backdrop-filter가 걸려 fixed 자손의
          containing block이 되어버리므로, 그 조상 밖에 둬야 전체 브라우저 너비
          기준으로 고정된다 (데스크탑에서도 390px 패널이 아닌 창 전체 중앙에 위치).
          bottom 오프셋 자체는 /photos(BottomNav 없음) 분기가 필요해 MusicPlayerDock 내부에서 처리.
        */}
        <MusicPlayerDock />

        {/*
          Service Worker 등록 — load 이벤트 후 실행해 초기 로드 성능에 영향 없게 함.
          프로덕션에서만 등록: next.config.ts는 dev 빌드에서 sw.js에 프리캐시 목록을
          채우지 않을 뿐 등록 자체를 막지는 않으므로, 여기서도 환경을 확인하지 않으면
          디스크에 남아있는 낡은 sw.js가 dev 서버에서도 계속 재등록되어 버린다.
        */}
        {process.env.NODE_ENV === "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(e){console.error('SW 등록 실패:',e);})})}`,
            }}
          />
        )}
      </body>
    </html>
  );
}
