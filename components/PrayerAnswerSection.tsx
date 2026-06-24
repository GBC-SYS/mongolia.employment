"use client";

import { useState, useEffect } from "react";
import { type PrayerAnswer } from "@/lib/db";

const PA_IDS_KEY = "mongol-pa-ids";

function loadMyIds(): Set<string> {
  try {
    const raw = localStorage.getItem(PA_IDS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveMyIds(ids: Set<string>) {
  try {
    localStorage.setItem(PA_IDS_KEY, JSON.stringify([...ids]));
  } catch {
    // Private Mode
  }
}

export default function PrayerAnswerSection({ letterId }: { letterId: string }) {
  const [answers, setAnswers] = useState<PrayerAnswer[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myIds, setMyIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMyIds(loadMyIds());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/prayer-answer/${letterId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => { if (!cancelled) setAnswers(data); })
      .catch(() => { if (!cancelled) setAnswers([]); })
      .finally(() => { if (!cancelled) setFetching(false); });
    return () => { cancelled = true; };
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
        const updated = new Set(myIds);
        updated.add(newAnswer.id);
        setMyIds(updated);
        saveMyIds(updated);
        setContent("");
        setAuthor("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  async function handleUpdate(id: string) {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/prayer-answer/item/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) throw new Error();
      const { answer } = await res.json();
      setAnswers((prev) => prev.map((a) => (a.id === id ? answer : a)));
      setEditingId(null);
    } catch {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("⚠️ 주의: 이 기도응답은 복구할 수 없습니다.\n\n다른 팀원의 기록일 수 있습니다. 정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/prayer-answer/item/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const updated = new Set(myIds);
      updated.delete(id);
      setMyIds(updated);
      saveMyIds(updated);
      setAnswers((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

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
          {answers.map((a) => {
            const isMine = myIds.has(a.id);
            const isEditing = editingId === a.id;
            return (
              <div
                key={a.id}
                className="rounded-2xl px-4 py-3 border border-black/8"
                style={{ background: "rgba(255,255,255,0.92)" }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-green-700">{a.author}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(a.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                    {isMine && !isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingId(a.id); setEditContent(a.content ?? ""); }}
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-full active:scale-95 transition-transform"
                          style={{
                            background: "rgba(59,130,246,0.1)",
                            color: "#2563eb",
                            border: "1px solid rgba(59,130,246,0.25)",
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-full active:scale-95 transition-transform"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#dc2626",
                            border: "1px solid rgba(239,68,68,0.25)",
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full text-sm bg-gray-100 rounded-xl px-3 py-2 outline-none resize-none text-gray-900 border border-gray-200"
                      style={{ fontSize: 16 }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(a.id)}
                        disabled={saving}
                        className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-white bg-green-700 disabled:opacity-40"
                      >
                        {saving ? "저장 중…" : "저장"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {a.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
