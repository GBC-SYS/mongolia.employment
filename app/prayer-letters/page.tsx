import { prayerLetters } from "@/data/prayer-letters";
import ImageViewer from "@/components/ImageViewer";
import PrayerHeartButton from "@/components/PrayerHeartButton";
import { getPrayerCount } from "@/lib/redis";

export const dynamic = "force-dynamic";

const glass = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.95)",
} as React.CSSProperties;

export default async function PrayerLettersPage() {
  const initialCount = await getPrayerCount();
  return (
    <div className="min-h-screen">
      <div className="px-5 pt-14 pb-6" style={glass}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">기도편지</h1>
            <p className="text-sm mt-1 font-medium text-gray-900">
              {prayerLetters.length > 0 ? `총 ${prayerLetters.length}개의 편지` : "몽골 선교 2026"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 pt-1">
            <PrayerHeartButton initialCount={initialCount} />
            <p className="text-gray-900 text-xs text-right leading-relaxed">
              기도에 동참해주신다면 하트를 눌러주세요<br />
              저희에게 큰 힘이 됩니다
            </p>
          </div>
        </div>
      </div>
      <ImageViewer letters={prayerLetters} />
    </div>
  );
}
