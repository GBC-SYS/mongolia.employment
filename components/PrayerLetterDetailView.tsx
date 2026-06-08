"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Xmark } from "iconoir-react";
import { type PrayerLetter } from "@/data/prayer-letters";
import KakaoShareButton from "@/components/KakaoShareButton";

export default function PrayerLetterDetailView({ letter }: { letter: PrayerLetter }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* 닫기 버튼 */}
      <div className="flex justify-end px-4 pt-12 pb-2 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition-colors"
        >
          <Xmark width={22} height={22} />
        </button>
      </div>

      {/* 이미지 */}
      <div className="flex-1 relative min-h-0">
        <Image
          src={letter.src}
          alt=""
          fill
          className="object-contain"
          sizes="100vw"
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
