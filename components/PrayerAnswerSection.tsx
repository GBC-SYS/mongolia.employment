"use client";

import { useState, useEffect } from "react";
import { type PrayerAnswer } from "@/lib/db";

export default function PrayerAnswerSection({ letterId }: { letterId: string }) {
  const [answers, setAnswers] = useState<PrayerAnswer[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/prayer-answer/${letterId}`)
      .then((r) => r.json())
      .then(setAnswers)
      .finally(() => setFetching(false));
  }, [letterId]);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/prayer-answer/${letterId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, content }),
      });
      if (res.ok) {
        const newAnswer: PrayerAnswer = await res.json();
        setAnswers((prev) => [newAnswer, ...prev]);
        setContent("");
        setAuthor("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-2 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-black/10" />
        <span className="text-xs font-semibold text-gray-500 tracking-wide">기도응답 나눔</span>
        <div className="h-px flex-1 bg-black/10" />
      </div>

      {/* 작성 폼 */}
      <div
        className="rounded-2xl p-4 mb-4 space-y-2 border border-gray-200 shadow-sm"
        style={{ background: "#ffffff" }}
      >
        <input
          type="text"
          placeholder="이름 (선택)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full text-sm bg-gray-100 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400 text-gray-900 border border-gray-200"
        />
        <textarea
          placeholder="응답받은 기도를 나눠주세요 🙏"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full text-sm bg-gray-100 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 resize-none placeholder:text-gray-400 text-gray-900 border border-gray-200"
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="w-full py-3 bg-green-700 text-white text-sm font-bold rounded-xl disabled:opacity-40 active:scale-95 transition-transform shadow-sm"
        >
          {submitting ? "전송 중..." : "나누기"}
        </button>
      </div>

      {/* 응답 목록 */}
      {fetching ? (
        <p className="text-xs text-gray-400 text-center py-4">불러오는 중...</p>
      ) : answers.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">
          아직 나눈 기도응답이 없어요
        </p>
      ) : (
        <div className="space-y-3">
          {answers.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl px-4 py-3 border border-black/8"
              style={{ background: "rgba(255,255,255,0.92)" }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-green-700">{a.author}</span>
                <span className="text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {a.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
