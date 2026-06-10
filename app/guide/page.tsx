import GuideAccordion from "@/components/GuideAccordion";
import Checklist from "@/components/Checklist";
import ClientOnly from "@/components/ClientOnly";
import { weatherData, safetyData, emergencyData } from "@/data/guide-content";
import { Phone, WarningTriangle } from "iconoir-react";

export const dynamic = "force-dynamic";

const glass = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
} as React.CSSProperties;

const brandDark = "#14532d";

export default function GuidePage() {
  return (
    <div className="min-h-screen pb-20 lg:pb-0" style={glass}>
      {/* 헤더 */}
      <div className="px-5 pt-14 pb-6" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.95)" }}>
        <h1 className="text-2xl font-bold text-gray-900">가이드북</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: brandDark }}>선교를 준비하며</p>
      </div>

      <ClientOnly>
      <div className="flex flex-col gap-3 px-4 py-4">
        {/* 날씨 */}
        <GuideAccordion sectionKey="weather" title={weatherData.title} emoji={weatherData.emoji}>
          <p className="text-sm text-gray-500 mb-3 leading-relaxed">
            {weatherData.subtitle}
          </p>
          <div className="flex flex-col gap-2">
            {weatherData.rows.map((row) => (
              <div key={row.label} className="flex gap-3 bg-white/60 rounded-xl p-3">
                <span className="text-xl flex-shrink-0">{row.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{row.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GuideAccordion>

        {/* 준비물 체크리스트 */}
        <GuideAccordion sectionKey="checklist" title="준비물 체크리스트" emoji="📋">
          <Checklist />
        </GuideAccordion>

        {/* 안전수칙 */}
        <GuideAccordion sectionKey="safety" title={safetyData.title} emoji={safetyData.emoji}>
          <div className="flex flex-col gap-4">
            {safetyData.categories.map((cat) => (
              <div key={cat.name}>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <span>{cat.emoji}</span>
                  {cat.name}
                </h4>
                <ul className="flex flex-col gap-2">
                  {cat.items.map((item) => (
                    <li key={item} className="flex gap-2 items-start">
                      <span className="mt-1 flex-shrink-0 text-xs" style={{ color: "#166534" }}>●</span>
                      <span className="text-sm text-gray-500 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </GuideAccordion>

        {/* 긴급 연락처 */}
        <GuideAccordion sectionKey="emergency" title={emergencyData.title} emoji={emergencyData.emoji}>
          {/* 대사관 */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <span>{emergencyData.embassy.emoji}</span>
              {emergencyData.embassy.name}
            </h4>
            <div className="flex flex-col gap-2">
              {emergencyData.embassy.contacts.map((c) => (
                <a
                  key={c.number}
                  href={`tel:${c.number}`}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                    c.highlight ? "bg-red-50 border border-red-200" : "bg-white/60"
                  }`}
                >
                  <span className={`text-sm ${c.highlight ? "text-red-600 font-medium" : "text-gray-700"}`}>
                    {c.label}
                  </span>
                  <Phone
                    width={16}
                    height={16}
                    className={c.highlight ? "text-red-500" : "text-gray-400"}
                    style={c.highlight ? undefined : { color: brandDark }}
                  />
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">⏰ {emergencyData.embassy.hours}</p>
          </div>

          {/* 현지 긴급 */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <WarningTriangle width={15} height={15} className="text-amber-500" />
              몽골 현지 긴급신고
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {emergencyData.local.map((c) => (
                <a
                  key={c.number}
                  href={`tel:${c.number}`}
                  className="flex flex-col items-center bg-white/60 rounded-xl py-3 gap-1"
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-xs text-gray-500">{c.label}</span>
                  <span className="text-lg font-bold" style={{ color: brandDark }}>{c.number}</span>
                </a>
              ))}
            </div>
          </div>

          {/* 비상 프로토콜 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 비상대응 절차</h4>
            <div className="flex flex-col gap-2">
              {emergencyData.protocol.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span
                    className="flex-shrink-0 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center border"
                    style={{ background: "rgba(22,101,52,0.1)", color: brandDark, borderColor: "rgba(22,101,52,0.3)" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-500 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </GuideAccordion>
      </div>
      </ClientOnly>
    </div>
  );
}
