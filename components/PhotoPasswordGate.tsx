"use client";

import { useState } from "react";
import { LockClosedIcon } from "@heroicons/react/24/outline";

const glass = {
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
} as React.CSSProperties;

interface Props {
  onSuccess: () => void;
}

const PHOTOS_PASSWORD = process.env.NEXT_PUBLIC_PHOTOS_PASSWORD ?? "";

export default function PhotoPasswordGate({ onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (password === PHOTOS_PASSWORD) {
        onSuccess();
      } else {
        setError("비밀번호가 틀립니다");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={glass}>
      <div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{
          ...glass,
          border: "1.5px solid rgba(255, 255, 255, 0.9)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.10)",
        }}
      >
        <div className="flex flex-col items-center gap-3 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(22, 101, 52, 0.10)" }}
          >
            <LockClosedIcon width={28} height={28} style={{ color: "#166534" }} />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">선교 사진</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              팀원 전용 콘텐츠입니다
              <br />
              비밀번호를 입력해 주세요
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            autoFocus
            className="w-full h-12 px-4 rounded-2xl text-sm outline-none text-gray-900 placeholder:text-gray-400"
            style={{
              background: "rgba(0, 0, 0, 0.05)",
              border: "1.5px solid rgba(0, 0, 0, 0.08)",
            }}
          />
          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="h-12 rounded-2xl text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-transform [touch-action:manipulation]"
            style={{ background: "#166534" }}
          >
            {loading ? "확인 중..." : "입장하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
