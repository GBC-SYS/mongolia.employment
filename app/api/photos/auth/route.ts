import { NextRequest, NextResponse } from "next/server";
import { createPhotosToken } from "@/lib/photos-auth";

export async function POST(req: NextRequest) {
  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const { PHOTOS_PASSWORD } = process.env;
  if (!PHOTOS_PASSWORD) {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  if (body.password !== PHOTOS_PASSWORD) {
    return NextResponse.json({ error: "비밀번호가 틀립니다" }, { status: 401 });
  }

  try {
    const token = createPhotosToken();
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }
}
