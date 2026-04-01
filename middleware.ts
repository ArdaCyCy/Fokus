import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { isClerkEnabled } from "@/lib/auth/clerk-config";
import { AB_COOKIE, pickAbVariant } from "@/lib/experiments/ab-variant";
import { rateLimitResponse } from "@/lib/ratelimit";

/** Giriş gerektirmeyen rotalar (Clerk açıkken korunan rotaların dışında kalanlar). */
const isPublicRoute = createRouteMatcher([
  "/",
  "/games(.*)",
  "/search(.*)",
  "/about(.*)",
  "/help(.*)",
  "/support(.*)",
  "/news(.*)",
  "/community(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/auth/sign-in(.*)",
  "/api/auth/sign-up(.*)",
  "/api/auth/sign-out(.*)",
  "/api/auth/me(.*)",
  "/api/health(.*)",
  "/api/webhooks(.*)",
  "/api/payments/iyzico/callback(.*)",
  "/api/uploadthing(.*)",
  "/sso-callback(.*)",
  "/developer",
  "/gelistirici",
  "/forgot-password",
  "/help",
  "/become-developer",
  "/gifts/claim(.*)",
]);

function isPrivateOrLocalHost(host: string): boolean {
  if (!host) return false;
  if (
    host === "localhost" ||
    host === "[::1]" ||
    host.endsWith(".local")
  ) {
    return true;
  }
  if (host === "127.0.0.1" || host.startsWith("127.")) return true;

  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const o = m.slice(1, 5).map((x) => Number(x));
  if (o.some((n) => n > 255)) return false;
  const [a, b] = o;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function buildSecurityHeaders(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const host = (req.headers.get("host") ?? "").split(":")[0]?.toLowerCase() ?? "";
  const isLocalHost = isPrivateOrLocalHost(host);

  /**
   * `next dev` veya yerelde `next start`: tam CSP + COOP/CORP + HSTS bazen
   * HMR / Clerk / overlay ile çakışıp sayfayı “konsol / bozuk” gösterir.
   * Canlı domainlerde tam set uygulanır.
   */
  const useMinimalSecurity =
    process.env.NODE_ENV !== "production" || isLocalHost;

  if (useMinimalSecurity) {
    return {
      "X-Request-Id": requestId,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    } as const;
  }

  const csp = [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "media-src 'self' https:",
    "font-src 'self' https: data:",
    "style-src 'self' 'unsafe-inline' https:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    /** wss: — HMR / Clerk vb. WebSocket */
    "connect-src 'self' https: wss:",
    "frame-src 'self' https: https://sandbox-cpp.iyzipay.com https://cpp.iyzipay.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https:",
  ].join("; ");

  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-site",
    "Content-Security-Policy": csp,
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Request-Id": requestId,
  } as const;
}

function applyAbCookie(res: NextResponse, req: NextRequest) {
  const ab = req.cookies.get(AB_COOKIE)?.value;
  const variant = pickAbVariant(ab);
  if (!ab) {
    res.cookies.set(AB_COOKIE, variant, {
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
      sameSite: "lax",
    });
  }
  res.headers.set("X-Fokus-AB", variant);
}

/**
 * Clerk publishable + secret yokken clerkMiddleware çalıştırılamaz (runtime hata).
 * Demo / yerel geliştirme bu durumda yalnızca güvenlik başlıkları + rate limit kullanır.
 */
async function middlewareWithoutClerk(req: NextRequest) {
  const securityHeaders = buildSecurityHeaders(req);

  const limited = await rateLimitResponse(req);
  if (limited) {
    Object.entries(securityHeaders).forEach(([k, v]) =>
      limited.headers.set(k, v),
    );
    return limited;
  }

  const res = NextResponse.next();
  Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v));
  applyAbCookie(res, req);
  return res;
}

const clerkOn = isClerkEnabled();

export default clerkOn
  ? clerkMiddleware(async (auth, req) => {
      const securityHeaders = buildSecurityHeaders(req);

      const limited = await rateLimitResponse(req);
      if (limited) {
        Object.entries(securityHeaders).forEach(([k, v]) =>
          limited.headers.set(k, v),
        );
        return limited;
      }

      if (!isPublicRoute(req)) {
        const { userId } = await auth();
        if (!userId) {
          const redirectUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
          const to = new URL(`/sign-in?redirect_url=${redirectUrl}`, req.url);
          const redirectRes = NextResponse.redirect(to);
          Object.entries(securityHeaders).forEach(([k, v]) =>
            redirectRes.headers.set(k, v),
          );
          applyAbCookie(redirectRes, req);
          return redirectRes;
        }
      }

      const res = NextResponse.next();
      Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v));
      applyAbCookie(res, req);
      return res;
    })
  : middlewareWithoutClerk;

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
