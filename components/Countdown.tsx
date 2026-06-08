"use client";

import { useState, useEffect } from "react";
import { Calendar } from "iconoir-react";
import { Card } from "@/components/ui/card";

const MISSION_START = new Date("2026-06-28T00:00:00+09:00");
const MISSION_END   = new Date("2026-07-04T23:59:59+09:00");


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

  if (phase === "before") {
    return (
      <Card className="px-6 py-4 text-center bg-white/5 border-white/10">
        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-sm mb-1">
          <Calendar width={14} height={14} />
          <span>출발까지</span>
        </div>
        <p className="text-5xl font-bold text-blue-300">D-{daysLeft}</p>
        <p className="text-slate-400 text-xs mt-1">6월 28일 출발</p>
      </Card>
    );
  }

  if (phase === "during") {
    return (
      <Card className="px-6 py-4 text-center bg-blue-900/30 border-blue-400/20">
        <div className="flex items-center justify-center gap-1.5 text-blue-300/70 text-sm mb-1">
          <Calendar width={14} height={14} />
          <span>몽골 사역 중</span>
        </div>
        <p className="text-5xl font-bold text-blue-300">{missionDay}일차</p>
        <p className="text-slate-500 text-xs mt-1">{missionDay} / 7일</p>
      </Card>
    );
  }

  return (
    <Card className="px-6 py-4 text-center bg-white/5 border-white/10">
      <p className="text-2xl mb-1">🙏</p>
      <p className="text-lg font-bold text-white">선교를 마쳤습니다</p>
      <p className="text-slate-400 text-xs mt-1">함께 기도해주셔서 감사합니다</p>
    </Card>
  );
}
