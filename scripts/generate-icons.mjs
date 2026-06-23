import sharp from "sharp";
import { mkdir } from "fs/promises";

await mkdir("public/icons", { recursive: true });

const src = "public/images/mongolia-mission-2026-hero.webp";
// 1024x1024 정사각형 — 크롭 없이 바로 리사이즈

// icon-512.png
await sharp(src).resize(512, 512).toFile("public/icons/icon-512.png");

// icon-192.png
await sharp(src).resize(192, 192).toFile("public/icons/icon-192.png");

// apple-touch-icon.png (iOS Safari 홈 화면 추가용)
await sharp(src).resize(180, 180).toFile("public/icons/apple-touch-icon.png");

// icon-maskable-512.png (Android 적응형 아이콘 — 브랜드 그린 배경 + 중앙 80% 이미지)
const innerSize = 410; // 512의 80% = safe zone
const padding = Math.floor((512 - innerSize) / 2); // 51px

const innerBuffer = await sharp(src).resize(innerSize, innerSize).toBuffer();

await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 22, g: 101, b: 52, alpha: 1 }, // #166534
  },
})
  .composite([{ input: innerBuffer, top: padding, left: padding }])
  .png()
  .toFile("public/icons/icon-maskable-512.png");

console.log("✅ 아이콘 생성 완료:");
console.log("  public/icons/icon-192.png");
console.log("  public/icons/icon-512.png");
console.log("  public/icons/icon-maskable-512.png");
console.log("  public/icons/apple-touch-icon.png");
