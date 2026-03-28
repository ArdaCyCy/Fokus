import { createHmac } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "fokus_demo_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

type Payload = {
  userId: string;
  exp: number;
};

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromB64url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getSecret(): string {
  return process.env.DEMO_AUTH_SECRET || process.env.CLERK_SECRET_KEY || "fokus-dev-secret";
}

function sign(content: string): string {
  return createHmac("sha256", getSecret()).update(content).digest("base64url");
}

export function makeDemoSessionToken(userId: string): string {
  const payload: Payload = {
    userId,
    exp: Date.now() + MAX_AGE_SEC * 1000,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function parseDemoSessionToken(token?: string | null): Payload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (sign(body) !== sig) return null;

  try {
    const payload = JSON.parse(fromB64url(body)) as Payload;
    if (!payload.userId || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setDemoSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, makeDemoSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearDemoSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function readDemoSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const parsed = parseDemoSessionToken(token);
  return parsed?.userId ?? null;
}
