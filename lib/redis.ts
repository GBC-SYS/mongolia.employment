import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const PRAYER_COUNT_KEY = "prayer_count";

export async function getPrayerCount(): Promise<number> {
  return (await redis.get<number>(PRAYER_COUNT_KEY)) ?? 0;
}
