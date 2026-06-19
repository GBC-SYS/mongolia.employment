export const dynamic = "force-dynamic";

import type { CSSProperties } from "react";
import ClientOnly from "@/components/ClientOnly";
import QtDayTabs from "@/components/QtDayTabs";
import QtContent from "@/components/QtContent";

const glass = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
} as CSSProperties;

const brandDark = "#14532d";

export default function QtPage() {
  return (
    <div className="min-h-screen pb-20 lg:pb-0" style={glass}>
      <div className="px-5 pt-14 pb-6" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.95)" }}>
        <h1 className="text-2xl font-bold text-gray-900">📖 매일 QT</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: brandDark }}>베드로전서 — 7일 묵상</p>
      </div>

      <ClientOnly>
        <div className="flex flex-col gap-3 px-4 py-4">
          <QtDayTabs />
          <QtContent />
        </div>
      </ClientOnly>
    </div>
  );
}
