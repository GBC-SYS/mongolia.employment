import sharp from "sharp";
import { mkdir } from "fs/promises";

await mkdir("public/icons", { recursive: true });

const src = "public/images/thumbnail2.webp";
// thumbnail2.webp는 1457x720 — 중앙 720x720 크롭
const cropLeft = Math.floor((1457 - 720) / 2); // 368

// icon-512.png
await sharp(src)
  .extract({ left: cropLeft, top: 0, width: 720, height: 720 })
  .resize(512, 512)
  .toFile("public/icons/icon-512.png");

// icon-192.png
await sharp(src)
  .extract({ left: cropLeft, top: 0, width: 720, height: 720 })
  .resize(192, 192)
  .toFile("public/icons/icon-192.png");

// apple-touch-icon.png (iOS Safari 홈 화면 추가용)
await sharp(src)
  .extract({ left: cropLeft, top: 0, width: 720, height: 720 })
  .resize(180, 180)
  .toFile("public/icons/apple-touch-icon.png");

// icon-maskable-512.png (Android 적응형 아이콘 — 브랜드 그린 배경 + 중앙 80% 이미지)
const innerSize = 410; // 512의 80% = safe zone
const padding = Math.floor((512 - innerSize) / 2); // 51px

const innerBuffer = await sharp(src)
  .extract({ left: cropLeft, top: 0, width: 720, height: 720 })
  .resize(innerSize, innerSize)
  .toBuffer();

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
