import { songData } from "@/data/guide-content";

const glass = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.95)",
} as React.CSSProperties;

const brandDark = "#14532d";

export default function SongPage() {
  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="px-5 pt-14 pb-6" style={glass}>
        <h1 className="text-2xl font-bold text-gray-900">합창곡</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: brandDark }}>송폼</p>
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
