import { NextRequest, NextResponse } from "next/server";
import { verifyPhotosToken } from "@/lib/photos-auth";

function isSafeFilename(filename: string): boolean {
  return /^[a-zA-Z0-9_\-. ]+$/.test(filename);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const token = req.headers.get("x-photos-token");
  if (!verifyPhotosToken(token)) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { filename } = await params;
  const decoded = decodeURIComponent(filename);
  if (!isSafeFilename(decoded)) {
    return NextResponse.json({ error: "잘못된 파일명" }, { status: 400 });
  }

  const { PHOTOS_NAS_URL, PHOTOS_NAS_API_KEY } = process.env;
  if (!PHOTOS_NAS_URL || !PHOTOS_NAS_API_KEY) {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  try {
    const nasRes = await fetch(
      `${PHOTOS_NAS_URL}/api/photo/${encodeURIComponent(decoded)}`,
      { headers: { "X-Api-Key": PHOTOS_NAS_API_KEY } }
    );
    if (!nasRes.ok) {
      return NextResponse.json({ error: "이미지 없음" }, { status: nasRes.status });
    }
    const contentType = nasRes.headers.get("Content-Type") ?? "image/jpeg";
    return new NextResponse(nasRes.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(decoded)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[photos/download]", err);
    return NextResponse.json({ error: "다운로드할 수 없습니다" }, { status: 502 });
  }
}
