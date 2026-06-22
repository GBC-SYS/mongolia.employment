"use client";

import { useRouter } from "next/navigation";
import { songData } from "@/data/guide-content";

const glass = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
} as React.CSSProperties;

const brandDark = "#14532d";

export default function SongPage() {
  const router = useRouter();

  const handleBack = () => {
    const isSameOrigin =
      document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (isSameOrigin) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-0" style={glass}>
      {/* 헤더 */}
      <div className="px-5 pt-14 pb-6" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.95)" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
            style={{ background: "rgba(243, 244, 246, 0.9)" }}
            aria-label="뒤로가기"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#374151" }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div>
            <p className="text-xs font-medium" style={{ color: brandDark }}>몽골 선교팀</p>
            <h1 className="text-2xl font-bold text-gray-900">합창곡</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-6">
        {/* 가사 */}
        <div
          className="rounded-2xl px-4 py-5 flex flex-col gap-1"
          style={{
            background: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.95)",
          }}
        >
          {songData.lyrics.map((part) => (
            <div key={part.label}>
              <p className="text-xs font-bold mt-3 mb-0.5" style={{ color: brandDark }}>{part.label}</p>
              {part.lines.map((line, i) => (
                <p key={i} className="text-base font-bold text-gray-900 leading-relaxed">{line}</p>
              ))}
            </div>
          ))}
        </div>

        {/* 한·몽 대역 */}
        <div
          className="rounded-2xl px-4 py-5 flex flex-col gap-4"
          style={{
            background: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.95)",
          }}
        >
          <p className="text-xs font-bold" style={{ color: brandDark }}>🇰🇷 한국어 · 🇲🇳 몽골어</p>
          {songData.bilingual.map((row, i) => (
            <div key={i}>
              <p className="text-base font-bold text-gray-900 leading-snug">{row.ko}</p>
              <p className="text-base font-bold text-gray-500 leading-snug">{row.mn}</p>
              <p className="text-sm font-bold leading-snug" style={{ color: brandDark }}>{row.pron}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
