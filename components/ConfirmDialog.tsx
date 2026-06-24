"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
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
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
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
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
            <p className="text-xs text-gray-600 leading-5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
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
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
            style={{ background: "#dc2626" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
