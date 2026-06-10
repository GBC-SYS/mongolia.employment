"use client";

import { useState, useEffect } from "react";
import { Calendar } from "iconoir-react";
import { Card } from "@/components/ui/card";

const MISSION_START = new Date("2026-06-28T00:00:00+09:00");
const MISSION_END   = new Date("2026-07-04T23:59:59+09:00");

const brand = "#166534";
const brandDark = "#14532d";

type Phase = "before" | "during" | "after";

export default function Countdown() {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [daysLeft, setDaysLeft] = useState(0);
  const [missionDay, setMissionDay] = useState(1);

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      if (now < MISSION_START) {
        const diff = MISSION_START.getTime() - now.getTime();
        setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
        setPhase("before");
      } else if (now <= MISSION_END) {
        const diff = now.getTime() - MISSION_START.getTime();
        const day = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
        setMissionDay(Math.min(day, 7));
        setPhase("during");
      } else {
        setPhase("after");
      }
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, []);

  if (phase === null) return null;

  const glass = {
    background: "rgba(255, 255, 255, 0.55)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.95)",
  } as React.CSSProperties;

  if (phase === "before") {
    return (
      <Card className="px-6 py-4 text-center border-0 rounded-2xl" style={glass}>
        <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mb-1">
          <Calendar width={14} height={14} />
          <span>출발까지</span>
        </div>
        <p className="text-5xl font-bold" style={{ color: brandDark }}>D-{daysLeft}</p>
        <p className="text-gray-500 text-xs mt-1">6월 28일 출발</p>
      </Card>
    );
  }

  if (phase === "during") {
    return (
      <Card className="px-6 py-4 text-center border-0 rounded-2xl" style={{ ...glass, background: "rgba(22, 101, 52, 0.08)" }}>
        <div className="flex items-center justify-center gap-1.5 text-sm mb-1" style={{ color: brandDark }}>
          <Calendar width={14} height={14} />
          <span>몽골 사역 중</span>
        </div>
        <p className="text-5xl font-bold" style={{ color: brandDark }}>{missionDay}일차</p>
        <p className="text-gray-500 text-xs mt-1">{missionDay} / 7일</p>
      </Card>
    );
  }

  return (
    <Card className="px-6 py-4 text-center border-0 rounded-2xl" style={glass}>
      <p className="text-2xl mb-1">🙏</p>
      <p className="text-lg font-bold text-gray-900">선교를 마쳤습니다</p>
      <p className="text-gray-500 text-xs mt-1">함께 기도해주셔서 감사합니다</p>
    </Card>
  );
}
