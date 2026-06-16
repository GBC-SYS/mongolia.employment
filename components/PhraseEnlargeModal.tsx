"use client";

import { useAtom } from "jotai";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { enlargedPhraseAtom } from "@/store/atoms";

export default function PhraseEnlargeModal() {
  const [phrase, setPhrase] = useAtom(enlargedPhraseAtom);

  if (!phrase) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.82)" }}
      onClick={() => setPhrase(null)}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-3xl px-8 py-10 flex flex-col items-center gap-6"
        style={{
          background: "rgba(255, 255, 255, 0.96)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 40px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setPhrase(null)}
          className="absolute top-4 right-4 p-2 rounded-full"
          style={{ background: "rgba(0,0,0,0.06)" }}
          aria-label="닫기"
        >
          <XMarkIcon width={20} height={20} strokeWidth={2.5} className="text-gray-700" />
        </button>

        <p
          className="text-center font-bold leading-snug text-gray-900"
          style={{ fontSize: "2rem", lineHeight: "1.3" }}
        >
          {phrase.mn}
        </p>

        <p className="text-center text-base text-gray-500 leading-relaxed">
          {phrase.pron}
        </p>

        <p className="text-xs text-gray-400">배경을 탭하면 닫힙니다</p>
      </div>
    </div>
  );
}
