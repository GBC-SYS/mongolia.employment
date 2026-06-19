import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const PRAYER_COUNT_KEY = "prayer_count";

export async function getPrayerCount(): Promise<number> {
  return (await redis.get<number>(PRAYER_COUNT_KEY)) ?? 0;
}

// QT 디브리핑
export interface QtDebriefing {
  id: string;
  author: string;
  grace: string;
  improvement: string;
  createdAt: string;
}

const QT_DEBRIEFING_PREFIX = "qt_debriefing";

export async function getQtDebriefings(day: number): Promise<QtDebriefing[]> {
  const raw = await redis.lrange(`${QT_DEBRIEFING_PREFIX}:${day}`, 0, -1);
  return raw.map((item) => {
    if (typeof item === "string") return JSON.parse(item) as QtDebriefing;
    return item as QtDebriefing;
  });
}

export async function addQtDebriefing(
  day: number,
  data: { author: string; grace: string; improvement: string }
): Promise<QtDebriefing> {
  const entry: QtDebriefing = {
    id: randomUUID(),
    author: data.author || "익명",
    grace: data.grace,
    improvement: data.improvement,
    createdAt: new Date().toISOString(),
  };
  await redis.lpush(`${QT_DEBRIEFING_PREFIX}:${day}`, entry);
  return entry;
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
  return raw.map((item) => {
    if (typeof item === "string") return JSON.parse(item) as PrayerAnswer;
    return item as PrayerAnswer;
  });
}

export async function addPrayerAnswer(
  letterId: string,
  data: { author: string; content: string }
): Promise<PrayerAnswer> {
  const answer: PrayerAnswer = {
    id: randomUUID(),
    author: data.author || "익명",
    content: data.content,
    createdAt: new Date().toISOString(),
  };
  await redis.lpush(`${PRAYER_ANSWER_PREFIX}:${letterId}`, answer);
  return answer;
}
