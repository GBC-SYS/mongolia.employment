"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });

export default function DesktopHero() {
  const pathname = usePathname();

  if (pathname === "/photos") return null;

  return (
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
  );
}
