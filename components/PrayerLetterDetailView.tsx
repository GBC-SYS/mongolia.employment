"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Xmark } from "iconoir-react";
import { type PrayerLetter } from "@/data/prayer-letters";
import KakaoShareButton from "@/components/KakaoShareButton";

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
      className="fixed inset-0 z-[200] flex flex-col"
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

      {/* 이미지 */}
      <div className="flex-1 min-h-0 overflow-y-auto flex items-start justify-center px-2">
        <Image
          src={letter.src}
          alt=""
          width={600}
          height={900}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      {/* 공유 버튼 */}
      <div className="flex-shrink-0 px-6 pt-4 pb-10">
        <KakaoShareButton src={letter.src} letterId={letter.id} />
      </div>
    </div>
  );
}
