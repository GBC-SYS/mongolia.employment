import { NextRequest, NextResponse } from "next/server";
import { getQtDebriefings, addQtDebriefing } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const day = Number(request.nextUrl.searchParams.get("day"));
  if (!day || day < 1 || day > 7) {
    return NextResponse.json({ error: "유효하지 않은 일차입니다." }, { status: 400 });
  }
  try {
    const entries = await getQtDebriefings(day);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[qt-debriefing GET]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: { day: unknown; author: unknown; grace: unknown; improvement: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { day, author, grace, improvement } = body;
  const dayNum = Number(day);

  if (!dayNum || dayNum < 1 || dayNum > 7) {
    return NextResponse.json({ error: "유효하지 않은 일차입니다." }, { status: 400 });
  }
  if (!String(grace ?? "").trim() && !String(improvement ?? "").trim()) {
    return NextResponse.json({ error: "내용을 입력해 주세요." }, { status: 400 });
  }

  try {
    const entry = await addQtDebriefing(dayNum, {
      author: String(author ?? "").trim() || "익명",
      grace: String(grace ?? "").trim(),
      improvement: String(improvement ?? "").trim(),
    });
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("[qt-debriefing POST]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
