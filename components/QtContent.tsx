"use client";

import { useAtom } from "jotai";
import { qtSelectedDayAtom, qtVerseOpenAtom } from "@/store/atoms";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { qtDays } from "@/data/qt-content";
import type { QtDebriefing } from "@/lib/redis";
import { useState, useEffect, useCallback } from "react";

function VerseBlock({ verses, passage }: { verses: string; passage: string }) {
  const [open, setOpen] = useAtom(qtVerseOpenAtom);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.9)",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900"
      >
        <span>
          📜 성경 본문 <span className="text-gray-600 font-normal">({passage})</span>
        </span>
        <ChevronDownIcon
          width={18}
          height={18}
          strokeWidth={2.5}
          className="transition-transform duration-200 flex-shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <p className="text-sm text-gray-800 leading-7 whitespace-pre-line pt-3">{verses}</p>
        </div>
      )}
    </div>
  );
}

function DebriefingForm({ day }: { day: number }) {
  const [author, setAuthor] = useState("");
  const [grace, setGrace] = useState("");
  const [improvement, setImprovement] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [entries, setEntries] = useState<QtDebriefing[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const fetchEntries = useCallback(async (signal?: AbortSignal) => {
    setLoadingEntries(true);
    try {
      const res = await fetch(`/api/qt-debriefing?day=${day}`, { signal });
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch (err) {
      if ((err as Error).name !== "AbortError") setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  }, [day]);

  useEffect(() => {
    const controller = new AbortController();
    fetchEntries(controller.signal);
    return () => controller.abort();
  }, [fetchEntries]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!grace.trim() && !improvement.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/qt-debriefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, author, grace, improvement }),
      });
      if (!res.ok) throw new Error();
      setAuthor("");
      setGrace("");

      setImprovement("");
      await fetchEntries();
    } catch {
      alert("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.9)",
        }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-3">✏️ 데일리 디브리핑</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="이름 (선택)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none"
            style={{
              background: "rgba(250,250,245,0.9)",
              border: "1px solid rgba(22,163,74,0.2)",
              fontSize: 16,
            }}
          />
          <textarea
            placeholder="오늘 발견한 영적 은혜를 나눠주세요"
            value={grace}
            onChange={(e) => setGrace(e.target.value)}
            rows={3}
            className="w-full rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none"
            style={{
              background: "rgba(250,250,245,0.9)",
              border: "1px solid rgba(22,163,74,0.2)",
              fontSize: 16,
            }}
          />
          <textarea
            placeholder="내일 사역을 위한 개선점"
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            rows={2}
            className="w-full rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none"
            style={{
              background: "rgba(250,250,245,0.9)",
              border: "1px solid rgba(22,163,74,0.2)",
              fontSize: 16,
            }}
          />
          <button
            type="submit"
            disabled={submitting || (!grace.trim() && !improvement.trim())}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: "#16A34A" }}
          >
            {submitting ? "저장 중…" : "기록하기"}
          </button>
        </form>
      </div>

      {loadingEntries ? (
        <p className="text-xs text-center text-gray-400">불러오는 중…</p>
      ) : entries.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 px-1">팀원들의 디브리핑</p>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.8)",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-green-700">{entry.author}</span>
                <span className="text-[10px] text-gray-500">
                  {new Date(entry.createdAt).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Seoul",
                  })}
                </span>
              </div>
              {entry.grace && (
                <p className="text-xs text-gray-800 mb-1">
                  <span className="font-semibold text-gray-600">은혜 </span>
                  {entry.grace}
                </p>
              )}
              {entry.improvement && (
                <p className="text-xs text-gray-800">
                  <span className="font-semibold text-gray-600">개선 </span>
                  {entry.improvement}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function QtContent() {
  const [selectedDay] = useAtom(qtSelectedDayAtom);
  const qt = qtDays[selectedDay - 1];

  if (!qt) return null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-green-700 mb-0.5">{qt.passage}</p>
        <h2 className="text-xl font-bold text-gray-900">
          {qt.day}일차: {qt.title}
        </h2>
      </div>

      <VerseBlock verses={qt.verses} passage={qt.passage} />

      <div
        className="rounded-2xl px-4 py-4"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.9)",
        }}
      >
        <p className="text-xs font-semibold text-green-700 mb-2">📖 오늘의 말씀</p>
        <blockquote
          className="text-sm text-gray-800 leading-7 italic whitespace-pre-line pl-3 font-medium"
          style={{ borderLeft: "3px solid #16A34A" }}
        >
          {qt.highlight}
        </blockquote>
      </div>

      <div
        className="rounded-2xl px-4 py-4"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.9)",
        }}
      >
        <p className="text-xs font-semibold text-amber-600 mb-2">💡 선교지의 지혜</p>
        <p className="text-sm text-gray-800 leading-7 whitespace-pre-line">{qt.wisdom}</p>
      </div>

      <div
        className="rounded-2xl px-4 py-3 flex items-start gap-3"
        style={{
          background: "rgba(22,163,74,0.16)",
          border: "2px solid rgba(22,163,74,0.5)",
        }}
      >
        <span className="text-lg mt-0.5">🙏</span>
        <div>
          <p className="text-xs font-semibold text-green-700 mb-1">한 줄 기도</p>
          <p className="text-sm text-gray-900 leading-6 font-medium">{qt.prayer}</p>
        </div>
      </div>

      <DebriefingForm day={selectedDay} />
    </div>
  );
}
