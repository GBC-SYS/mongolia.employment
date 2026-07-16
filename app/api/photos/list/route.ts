import { NextRequest, NextResponse } from "next/server";
import { verifyPhotosToken } from "@/lib/photos-auth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-photos-token");
  if (!verifyPhotosToken(token)) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { PHOTOS_NAS_URL, PHOTOS_NAS_API_KEY } = process.env;
  if (!PHOTOS_NAS_URL || !PHOTOS_NAS_API_KEY) {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  try {
    const res = await fetch(`${PHOTOS_NAS_URL}/api/photos`, {
      headers: { "X-Api-Key": PHOTOS_NAS_API_KEY },
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error(`NAS error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[photos/list]", err);
    return NextResponse.json({ error: "사진 목록을 불러올 수 없습니다" }, { status: 502 });
  }
}
