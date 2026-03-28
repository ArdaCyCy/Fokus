import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { setDemoSessionCookie } from "@/lib/auth/demo-session";
import { verifyPassword } from "@/lib/auth/password";
import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getOrCreateRequestId, jsonWithRequestId } from "@/lib/api-observability";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const limited = await enforceApiRateLimit(req, {
    key: "auth-sign-in",
    limit: 10,
    window: "1 m",
  });
  if (limited) {
    limited.headers.set("X-Request-Id", requestId);
    return limited;
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    auditLog("warn", "auth.sign_in.invalid_payload", { requestId });
    return jsonWithRequestId(
      { error: "Geçersiz veri", issues: parsed.error.flatten() },
      { status: 400 },
      requestId
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await db.user.findFirst({ where: { email } });
  if (!user || !user.passwordHash) {
    auditLog("warn", "auth.sign_in.failed", { requestId, email });
    return jsonWithRequestId({ error: "E-posta veya şifre hatalı" }, { status: 401 }, requestId);
  }

  const ok = verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    auditLog("warn", "auth.sign_in.failed", { requestId, email, userId: user.id });
    return jsonWithRequestId({ error: "E-posta veya şifre hatalı" }, { status: 401 }, requestId);
  }

  await setDemoSessionCookie(user.id);
  auditLog("info", "auth.sign_in.success", { requestId, userId: user.id });
  return jsonWithRequestId({ ok: true, userId: user.id }, undefined, requestId);
}
