"use client";

import { useState } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";

const STORAGE_KEY = "prayer_heart_clicked";

export default function PrayerHeartButton({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = useState<number>(initialCount);
  // lazy initializer: 렌더 시점에 localStorage를 읽어 초기값 계산 → effect 불필요
  const [clicked, setClicked] = useState(() =>
    typeof window === "undefined" ? false : localStorage.getItem(STORAGE_KEY) === "true"
  );
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (clicked || loading) return;
    setLoading(true);
    setClicked(true);
    setCount((c) => (c ?? 0) + 1);
    localStorage.setItem(STORAGE_KEY, "true");
    try {
      const res = await fetch("/api/prayer-count", { method: "POST" });
      const d = await res.json();
      setCount(d.count);
    } catch {
      setClicked(false);
      setCount((c) => Math.max(0, (c ?? 1) - 1));
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={clicked || loading}
      className="flex items-center gap-1.5 transition-transform active:scale-90"
      aria-label="기도해요"
    >
      <HeartIcon
        width={22}
        height={22}
        className={clicked ? "fill-rose-500 text-rose-500" : "text-gray-400"}
      />
      <span className={`text-sm font-semibold tabular-nums ${clicked ? "text-rose-500" : "text-gray-400"}`}>
        {count.toLocaleString()}
      </span>
    </button>
  );
}
