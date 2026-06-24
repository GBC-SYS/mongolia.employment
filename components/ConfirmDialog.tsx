"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "삭제",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  // useLayoutEffect: DOM 준비 여부를 확인하는 목적 → 페인트 전 동기 실행으로 cascade 경고 없음
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  // ESC 키로 다이얼로그 닫기 (접근성 + UX)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  // 모바일: fixed(뷰포트 기준) / 데스크탑 lg: absolute(#app-panel 기준)
  // backdrop-filter 조상은 fixed 자식만 containing block으로 가두므로
  // lg에서 absolute로 전환하면 390px 패널 안에만 노출됨
  // #app-panel은 lg:absolute이므로 containing block 역할을 수행함
  const target = document.getElementById("app-panel") ?? document.body;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      className="fixed inset-0 lg:absolute lg:inset-0 z-[9999] flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          {/* aria-hidden: 장식 이모지는 스크린 리더에서 무시 */}
          <span className="text-xl mt-0.5" aria-hidden="true">⚠️</span>
          <div>
            <p id="confirm-dialog-title" className="text-sm font-bold text-gray-900 mb-1">{title}</p>
            <p id="confirm-dialog-message" className="text-xs text-gray-600 leading-5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 active:scale-95 transition-transform"
            style={{
              background: "rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
            style={{ background: "#dc2626" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    target
  );
}
