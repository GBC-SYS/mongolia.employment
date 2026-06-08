import { prayerLetters } from "@/data/prayer-letters";
import ImageViewer from "@/components/ImageViewer";
import PrayerHeartButton from "@/components/PrayerHeartButton";

export default function PrayerLettersPage() {
  return (
    <div className="min-h-screen bg-[#0b1120]">
      <div className="px-5 pt-14 pb-6" style={{ background: "linear-gradient(160deg,#0d1a30 0%,#111e35 100%)" }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">기도편지</h1>
            <p className="text-blue-300/70 text-sm mt-1">
              {prayerLetters.length > 0 ? `총 ${prayerLetters.length}개의 편지` : "몽골 선교 2026"}
            </p>
          </div>
          <PrayerHeartButton />
        </div>
      </div>
      <ImageViewer letters={prayerLetters} />
    </div>
  );
}
