"use client";

import { useAtom, useSetAtom } from "jotai";
import { qtSelectedDayAtom, qtVerseOpenAtom } from "@/store/atoms";
import { useEffect } from "react";

const MISSION_START = new Date("2026-06-28T00:00:00+09:00");

function getTodayDay(): number {
  const nowKST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const diff = Math.floor((nowKST.getTime() - MISSION_START.getTime()) / 86400000);
  return Math.min(Math.max(diff + 1, 1), 7);
}

function getDayDate(day: number): string {
  const d = new Date(MISSION_START.getTime() + (day - 1) * 86400000);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function QtDayTabs() {
  const [selectedDay, setSelectedDay] = useAtom(qtSelectedDayAtom);
  const setVerseOpen = useSetAtom(qtVerseOpenAtom);
  const todayDay = getTodayDay();

  useEffect(() => {
    setSelectedDay(todayDay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(day: number) {
    setSelectedDay(day);
    setVerseOpen(false);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
      {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
        const isSelected = selectedDay === day;
        const isToday = todayDay === day;
        return (
          <button
            key={day}
            onClick={() => handleSelect(day)}
            className="flex-shrink-0 flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl text-sm font-medium transition-all"
            style={
              isSelected
                ? { background: "#16A34A", color: "#fff" }
                : {
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px) saturate(180%)",
                    WebkitBackdropFilter: "blur(12px) saturate(180%)",
                    color: "#111827",
                    border: "1px solid rgba(255,255,255,0.9)",
                  }
            }
          >
            <span>{day}일</span>
            <span
              className="text-[10px] font-semibold"
              style={{
                color: isSelected
                  ? isToday ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)"
                  : isToday ? "#16A34A" : "#6B7280",
              }}
            >
              {getDayDate(day)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
