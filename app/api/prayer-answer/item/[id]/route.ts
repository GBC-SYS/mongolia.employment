import { NextRequest, NextResponse } from "next/server";
import { updatePrayerAnswer, deletePrayerAnswer } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  let body: { content?: unknown };
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
    const answer = await updatePrayerAnswer(id, { content });
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[prayer-answer PUT]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await deletePrayerAnswer(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[prayer-answer DELETE]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
