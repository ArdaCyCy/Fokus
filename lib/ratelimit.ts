import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import { type NextRequest, NextResponse } from "next/server";

function createLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "focus:middleware",
  });
}

const limiter = createLimiter();

export function getMiddlewareRatelimit(): Ratelimit | null {
  return limiter;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "anonymous";
}

/** 429 response when over limit; null when allowed or when Upstash is not configured. */
export async function rateLimitResponse(
  req: NextRequest
): Promise<NextResponse | null> {
  /** HTML sayfalarında Redis beklenmesin (Vercel’de ilk bayt süresi ve gezinme hızı). Yalnız API korumalı. */
  if (!req.nextUrl.pathname.startsWith("/api")) return null;
  if (req.nextUrl.pathname.startsWith("/api/webhooks")) return null;
  const rl = getMiddlewareRatelimit();
  if (!rl) return null;

  try {
    const { success, reset } = await rl.limit(getClientIp(req));
    if (success) return null;

    const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen bir süre sonra tekrar deneyin." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    );
  } catch (e) {
    console.error(
      "[Fokus] Middleware rate limit (Upstash) hatası — istek geçiriliyor:",
      e,
    );
    return null;
  }
}
