import { prayerLetters } from "@/data/prayer-letters";
import { notFound } from "next/navigation";
import PrayerLetterDetailView from "@/components/PrayerLetterDetailView";

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
