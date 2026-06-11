import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const imagePath = path.join(process.cwd(), "public", "images", "prayer-letters", `${id}.webp`);

  if (!fs.existsSync(imagePath)) {
    return new NextResponse("이미지를 찾을 수 없습니다", { status: 404 });
  }

  const buffer = await sharp(imagePath)
    .resize({
      width: 800,
      height: 400,
      fit: "cover",
      position: "top", // 상단 기준 크롭
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
