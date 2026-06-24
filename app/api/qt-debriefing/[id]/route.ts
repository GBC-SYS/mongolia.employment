import { NextRequest, NextResponse } from "next/server";
import { updateQtDebriefing, deleteQtDebriefing } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  let body: { grace?: unknown; improvement?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const grace = String(body.grace ?? "").trim();
  const improvement = String(body.improvement ?? "").trim();

  if (!grace && !improvement) {
    return NextResponse.json({ error: "내용을 입력해 주세요." }, { status: 400 });
  }

  try {
    const entry = await updateQtDebriefing(id, { grace, improvement });
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("[qt-debriefing PUT]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await deleteQtDebriefing(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[qt-debriefing DELETE]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
