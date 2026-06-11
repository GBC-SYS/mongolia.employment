"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Xmark } from "iconoir-react";
import { type PrayerLetter } from "@/data/prayer-letters";
import KakaoShareButton from "@/components/KakaoShareButton";
import PrayerAnswerSection from "@/components/PrayerAnswerSection";

export default function PrayerLetterDetailView({ letter }: { letter: PrayerLetter }) {
  const router = useRouter();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/prayer-letters");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}
    >
      {/* 닫기 버튼 */}
      <div className="flex justify-end px-4 pt-12 pb-2 flex-shrink-0">
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/10 text-gray-700 active:bg-black/20 transition-colors"
        >
          <Xmark width={22} height={22} />
        </button>
      </div>

      {/* 스크롤 영역: 이미지 + 공유버튼 + 기도응답 */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex justify-center px-2 pt-2">
          <Image
            src={letter.src}
            alt=""
            width={600}
            height={900}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        <div className="px-6 pt-4 pb-2">
          <KakaoShareButton src={letter.src} letterId={letter.id} />
        </div>

        <PrayerAnswerSection letterId={letter.id} />
      </div>
    </div>
  );
}
