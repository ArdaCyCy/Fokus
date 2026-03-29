import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

type WindowUnit = "s" | "m" | "h";
type WindowDuration = `${number} ${WindowUnit}`;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

function buildLimiter(limit: number, window: WindowDuration, prefix: string): Ratelimit | null {
  if (!redisUrl || !redisToken) return null;
  return new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix,
  });
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "anonymous";
}

export async function enforceApiRateLimit(
  req: NextRequest,
  options: { key: string; limit: number; window: WindowDuration }
): Promise<NextResponse | null> {
  const limiter = buildLimiter(options.limit, options.window, `focus:api:${options.key}`);
  if (!limiter) return null;

  const identifier = `${options.key}:${getClientIp(req)}`;
  const { success, reset } = await limiter.limit(identifier);
  if (success) return null;

  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Çok fazla istek. Lütfen biraz sonra tekrar deneyin." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "Cache-Control": "no-store",
      },
    }
  );
}
