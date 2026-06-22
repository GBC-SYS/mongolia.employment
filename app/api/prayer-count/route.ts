import { NextResponse } from "next/server";
import { getPrayerCount, incrementPrayerCount } from "@/lib/db";

export async function GET() {
  const count = await getPrayerCount();
  return NextResponse.json({ count });
}

export async function POST() {
  const count = await incrementPrayerCount();
  return NextResponse.json({ count });
}
