import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "depresso-admin-session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/**
 * The admin session cookie value: `<expiresAt>.<hmac>`. Not a JWT (no need
 * for the extra format/claims machinery for a single-role demo gate), but
 * the same idea — a payload plus a signature that only the server can
 * produce, so a visitor can't just set the cookie by hand in devtools.
 */
export function createSessionToken(): { value: string; maxAgeSeconds: number } {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const value = `${payload}.${sign(payload)}`;
  return { value, maxAgeSeconds: SESSION_TTL_MS / 1000 };
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;
  if (!timingSafeEqual(expectedBuf, actualBuf)) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

export function verifyDemoPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_DEMO_PASSWORD;
  if (!expected) throw new Error("Missing ADMIN_DEMO_PASSWORD");

  const expectedBuf = Buffer.from(expected);
  const candidateBuf = Buffer.from(candidate);
  if (expectedBuf.length !== candidateBuf.length) return false;
  return timingSafeEqual(expectedBuf, candidateBuf);
}

export { COOKIE_NAME as ADMIN_SESSION_COOKIE_NAME };
