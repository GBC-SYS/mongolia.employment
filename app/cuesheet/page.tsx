"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cueSheets, type CueSheetRow } from "@/data/cuesheet";

const brand = "#166534";
const brandDark = "#14532d";

const glass = {
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
} as React.CSSProperties;

const rowTypeConfig: Record<string, { bg: string; border: string; noColor: string }> = {
  rehearsal: {
    bg: "rgba(107, 114, 128, 0.06)",
    border: "rgba(107, 114, 128, 0.15)",
    noColor: "#9ca3af",
  },
  setup: {
    bg: "rgba(107, 114, 128, 0.06)",
    border: "rgba(107, 114, 128, 0.15)",
    noColor: "#9ca3af",
  },
  cleanup: {
    bg: "rgba(107, 114, 128, 0.06)",
    border: "rgba(107, 114, 128, 0.15)",
    noColor: "#9ca3af",
  },
  emcee: {
    bg: "rgba(22, 101, 52, 0.06)",
    border: "rgba(22, 101, 52, 0.2)",
    noColor: brand,
  },
  performance: {
    bg: "rgba(255, 255, 255, 0.85)",
    border: "rgba(255, 255, 255, 0.9)",
    noColor: "#1d4ed8",
  },
};

const tagColors: Record<string, string> = {
  stage: "rgba(124, 58, 237, 0.1)",
  mic: "rgba(37, 99, 235, 0.1)",
  audio: "rgba(5, 150, 105, 0.1)",
  screen: "rgba(217, 119, 6, 0.1)",
  light: "rgba(202, 138, 4, 0.1)",
  etc: "rgba(107, 114, 128, 0.12)",
};

const tagTextColors: Record<string, string> = {
  stage: "#6d28d9",
  mic: "#1d4ed8",
  audio: "#047857",
  screen: "#b45309",
  light: "#854d0e",
  etc: "#374151",
};

function TechTag({ label, value, type }: { label: string; value: string; type: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: tagColors[type], color: tagTextColors[type] }}
    >
      <span className="opacity-60 text-[10px] uppercase tracking-wide">{label}</span>
      {value}
    </span>
  );
}

function CueRow({ row }: { row: CueSheetRow }) {
  const config = rowTypeConfig[row.type];
  const isSpecial = row.type === "rehearsal" || row.type === "setup" || row.type === "cleanup";

  const hasTechInfo = row.stage || row.mic || row.audio || row.screen || row.light || row.etc;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* 행 헤더: no + time + runTimes */}
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: `1px solid ${config.border}` }}>
        <span
          className="font-mono text-xs font-bold w-6 text-center"
          style={{ color: config.noColor }}
        >
          {row.no !== undefined ? `#${row.no}` : "·"}
        </span>
        <span className="font-mono text-sm font-semibold text-gray-800 flex-1">
          {row.time}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          {row.runTimes.includes(":") ? row.runTimes : `${row.runTimes}분`}
        </span>
      </div>

      {/* 공연 내용 */}
      <div className="px-4 py-3">
        {row.artist && !isSpecial && (
          <p className="text-xs font-semibold mb-1" style={{ color: brandDark }}>
            {row.artist}
          </p>
        )}
        <p
          className={`font-medium leading-snug ${isSpecial ? "text-gray-500 text-sm" : "text-gray-900 text-base"}`}
        >
          {row.contents}
        </p>
      </div>

      {/* 기술 정보 태그 */}
      {hasTechInfo && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {row.stage && <TechTag label="Stage" value={row.stage} type="stage" />}
          {row.mic && <TechTag label="MIC" value={row.mic} type="mic" />}
          {row.audio && <TechTag label="Audio" value={row.audio} type="audio" />}
          {row.screen && <TechTag label="Screen" value={row.screen} type="screen" />}
          {row.light && <TechTag label="Light" value={row.light} type="light" />}
          {row.etc && <TechTag label="ETC" value={row.etc} type="etc" />}
        </div>
      )}
    </div>
  );
}

export default function CuesheetPage() {
  const [activeId, setActiveId] = useState(cueSheets[0].id);
  const router = useRouter();
  const active = cueSheets.find((s) => s.id === activeId)!;

  return (
    <div className="min-h-screen flex flex-col pb-24" style={glass}>
      {/* 헤더 */}
      <div
        className="sticky top-0 z-20 px-5 pt-14 pb-4"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => {
              const isSameOrigin = (() => {
                try {
                  return (
                    !!document.referrer &&
                    new URL(document.referrer).origin === window.location.origin
                  );
                } catch {
                  return false;
                }
              })();
              if (isSameOrigin) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full active:scale-95 transition-transform"
            style={{ background: "rgba(0,0,0,0.06)" }}
            aria-label="뒤로가기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div>
            <p className="text-xs font-medium" style={{ color: brandDark }}>몽골 선교팀</p>
            <h1 className="text-xl font-bold text-gray-900">공연 큐시트</h1>
          </div>
        </div>

        {/* 날짜 탭 */}
        <div
          className="flex gap-2 p-1 rounded-2xl"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          {cueSheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => setActiveId(sheet.id)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={
                activeId === sheet.id
                  ? {
                      background: "white",
                      color: brandDark,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                    }
                  : { color: "#6b7280" }
              }
            >
              {sheet.shortDate}
            </button>
          ))}
        </div>
      </div>

      {/* 공연명 */}
      <div className="px-5 pt-4 pb-2">
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: `rgba(22,101,52,0.08)`,
            border: "1px solid rgba(22,101,52,0.15)",
          }}
        >
          <p className="text-xs font-medium text-gray-500 mb-0.5">{active.date}</p>
          <p className="text-base font-bold" style={{ color: brandDark }}>
            {active.venue}
          </p>
        </div>
      </div>

      {/* 범례 */}
      <div className="px-5 py-2 flex flex-wrap gap-2">
        {[
          { label: "공연팀", color: "#1d4ed8", bg: "rgba(37,99,235,0.08)" },
          { label: "사회자", color: brand, bg: "rgba(22,101,52,0.08)" },
          { label: "준비/정리", color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
        ].map(({ label, color, bg }) => (
          <span
            key={label}
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ color, background: bg }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* 큐시트 행 목록 */}
      <div className="px-4 flex flex-col gap-2.5 pt-1">
        {active.rows.map((row, idx) => (
          <CueRow key={`${activeId}-${idx}`} row={row} />
        ))}
      </div>
    </div>
  );
}
