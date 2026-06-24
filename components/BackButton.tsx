"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  const handleBack = () => {
    const isSameOrigin =
      document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (isSameOrigin) {
      router.back();
    } else {
      router.replace(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
      style={{ background: "rgba(243, 244, 246, 0.9)" }}
      aria-label="뒤로가기"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "#374151" }}
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
