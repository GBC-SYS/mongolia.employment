import { NextRequest, NextResponse } from "next/server";
import { getPrayerAnswers, addPrayerAnswer } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ letterId: string }> }
) {
  const { letterId } = await params;
  try {
    const answers = await getPrayerAnswers(letterId);
    return NextResponse.json(answers);
  } catch (err) {
    console.error("[prayer-answer GET]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ letterId: string }> }
) {
  const { letterId } = await params;
  let body: { author?: unknown; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const content = String(body.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ error: "내용을 입력해 주세요." }, { status: 400 });
  }

  try {
    const answer = await addPrayerAnswer(letterId, {
      author: String(body.author ?? "").trim() || "익명",
      content,
    });
    return NextResponse.json(answer, { status: 201 });
  } catch (err) {
    console.error("[prayer-answer POST]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
