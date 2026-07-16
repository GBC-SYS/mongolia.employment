import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function createPhotosToken(): string {
  const secret = process.env.PHOTOS_SECRET;
  if (!secret) throw new Error("PHOTOS_SECRET 환경변수가 설정되지 않았습니다");

  const iat = Date.now();
  const encodedPayload = Buffer.from(JSON.stringify({ iat })).toString("base64url");
  const hmac = createHmac("sha256", secret).update(encodedPayload).digest("hex");
  return `${encodedPayload}.${hmac}`;
}

export function verifyPhotosToken(token: string | null): boolean {
  if (!token) return false;
  const secret = process.env.PHOTOS_SECRET;
  if (!secret) return false;

  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;

  const encodedPayload = token.slice(0, dotIndex);
  const providedHmac = token.slice(dotIndex + 1);

  let payload: { iat?: number };
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
  } catch {
    return false;
  }

  if (typeof payload.iat !== "number") return false;
  if (Date.now() - payload.iat > TOKEN_TTL_MS) return false;

  const expectedHmac = createHmac("sha256", secret).update(encodedPayload).digest("hex");

  try {
    const provided = Buffer.from(providedHmac, "hex");
    const expected = Buffer.from(expectedHmac, "hex");
    if (provided.length !== expected.length) return false;
    return timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}
