import { prayerLetters } from "@/data/prayer-letters";
import { notFound } from "next/navigation";
import PrayerLetterDetailView from "@/components/PrayerLetterDetailView";

// SW additionalPrecacheEntries와 일치하는 정적 경로를 빌드 타임에 생성
// 이 선언이 없으면 Dynamic 렌더링이 되어 SW precache 전략과 충돌함
export function generateStaticParams() {
  return prayerLetters.map((letter) => ({ id: letter.id }));
}

export default async function PrayerLetterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const letter = prayerLetters.find((l) => l.id === id);
  if (!letter) notFound();

  return <PrayerLetterDetailView letter={letter} />;
}
