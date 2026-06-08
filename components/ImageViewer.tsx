import Image from "next/image";
import Link from "next/link";
import { Mail } from "iconoir-react";
import { type PrayerLetter } from "@/data/prayer-letters";

interface Props {
  letters: PrayerLetter[];
}

export default function ImageViewer({ letters }: Props) {
  if (letters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <Mail width={48} height={48} strokeWidth={1} />
        <p className="text-sm">아직 기도편지가 없습니다</p>
        <p className="text-xs text-slate-600">
          public/images/prayer-letters/ 폴더에 이미지를 추가하세요
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {letters.map((letter) => (
        <Link
          key={letter.id}
          href={`/prayer-letters/${letter.id}`}
          className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 shadow-sm active:scale-95 transition-transform block"
        >
          <Image
            src={letter.src}
            alt=""
            fill
            className="object-contain"
            sizes="50vw"
          />
        </Link>
      ))}
    </div>
  );
}
