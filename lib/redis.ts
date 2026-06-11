import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const PRAYER_COUNT_KEY = "prayer_count";

export async function getPrayerCount(): Promise<number> {
  return (await redis.get<number>(PRAYER_COUNT_KEY)) ?? 0;
}

// 기도응답
export interface PrayerAnswer {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

const PRAYER_ANSWER_PREFIX = "prayer_answers";

export async function getPrayerAnswers(letterId: string): Promise<PrayerAnswer[]> {
  const raw = await redis.lrange(`${PRAYER_ANSWER_PREFIX}:${letterId}`, 0, -1);
  return raw as unknown as PrayerAnswer[];
}

export async function addPrayerAnswer(
  letterId: string,
  data: { author: string; content: string }
): Promise<PrayerAnswer> {
  const answer: PrayerAnswer = {
    id: Date.now().toString(),
    author: data.author || "익명",
    content: data.content,
    createdAt: new Date().toISOString(),
  };
  await redis.lpush(`${PRAYER_ANSWER_PREFIX}:${letterId}`, answer);
  return answer;
}
