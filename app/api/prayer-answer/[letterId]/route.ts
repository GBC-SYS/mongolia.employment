import { NextRequest, NextResponse } from "next/server";
import { getPrayerAnswers, addPrayerAnswer } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ letterId: string }> }
) {
  const { letterId } = await params;
  const answers = await getPrayerAnswers(letterId);
  return NextResponse.json(answers);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ letterId: string }> }
) {
  const { letterId } = await params;
  const { author, content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "내용을 입력해주세요" }, { status: 400 });
  }

  const answer = await addPrayerAnswer(letterId, {
    author: author?.trim() || "익명",
    content: content.trim(),
  });

  return NextResponse.json(answer, { status: 201 });
}
