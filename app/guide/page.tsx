import GuideAccordion from "@/components/GuideAccordion";
import Checklist from "@/components/Checklist";
import ClientOnly from "@/components/ClientOnly";
import { weatherData, safetyData, emergencyData } from "@/data/guide-content";
import { Phone, WarningTriangle } from "iconoir-react";

export const dynamic = "force-dynamic";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#0b1120]">
      {/* 헤더 */}
      <div className="px-5 pt-14 pb-6" style={{ background: "linear-gradient(160deg,#0d1a30 0%,#111e35 100%)" }}>
        <h1 className="text-2xl font-bold text-white">가이드북</h1>
        <p className="text-blue-300/70 text-sm mt-1">선교를 준비하며</p>
      </div>

      <ClientOnly>
      <div className="flex flex-col gap-3 px-4 py-4">
        {/* 날씨 */}
        <GuideAccordion sectionKey="weather" title={weatherData.title} emoji={weatherData.emoji}>
          <p className="text-sm text-slate-400 mb-3 leading-relaxed">
            {weatherData.subtitle}
          </p>
          <div className="flex flex-col gap-2">
            {weatherData.rows.map((row) => (
              <div key={row.label} className="flex gap-3 bg-white/5 rounded-xl p-3">
                <span className="text-xl flex-shrink-0">{row.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-slate-300">{row.label}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{row.desc}</p>
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
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <span>{cat.emoji}</span>
                  {cat.name}
                </h4>
                <ul className="flex flex-col gap-2">
                  {cat.items.map((item) => (
                    <li key={item} className="flex gap-2 items-start">
                      <span className="text-blue-400 mt-1 flex-shrink-0 text-xs">●</span>
                      <span className="text-sm text-slate-400 leading-relaxed">{item}</span>
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
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <span>{emergencyData.embassy.emoji}</span>
              {emergencyData.embassy.name}
            </h4>
            <div className="flex flex-col gap-2">
              {emergencyData.embassy.contacts.map((c) => (
                <a
                  key={c.number}
                  href={`tel:${c.number}`}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                    c.highlight ? "bg-red-900/30 border border-red-500/30" : "bg-white/5"
                  }`}
                >
                  <span className={`text-sm ${c.highlight ? "text-red-300 font-medium" : "text-slate-300"}`}>
                    {c.label}
                  </span>
                  <Phone
                    width={16}
                    height={16}
                    className={c.highlight ? "text-red-400" : "text-blue-400"}
                  />
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">⏰ {emergencyData.embassy.hours}</p>
          </div>

          {/* 현지 긴급 */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <WarningTriangle width={15} height={15} className="text-amber-400" />
              몽골 현지 긴급신고
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {emergencyData.local.map((c) => (
                <a
                  key={c.number}
                  href={`tel:${c.number}`}
                  className="flex flex-col items-center bg-white/5 rounded-xl py-3 gap-1"
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-xs text-slate-400">{c.label}</span>
                  <span className="text-lg font-bold text-blue-300">{c.number}</span>
                </a>
              ))}
            </div>
          </div>

          {/* 비상 프로토콜 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">📋 비상대응 절차</h4>
            <div className="flex flex-col gap-2">
              {emergencyData.protocol.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500/30 text-blue-300 text-xs font-bold rounded-full flex items-center justify-center border border-blue-400/30">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-400 leading-relaxed">{step}</p>
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
