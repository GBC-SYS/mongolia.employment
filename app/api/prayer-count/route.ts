import { NextResponse } from "next/server";
import { redis, PRAYER_COUNT_KEY, getPrayerCount } from "@/lib/redis";

export async function GET() {
  const count = await getPrayerCount();
  return NextResponse.json({ count });
}

export async function POST() {
  const count = await redis.incr(PRAYER_COUNT_KEY);
  return NextResponse.json({ count });
}
