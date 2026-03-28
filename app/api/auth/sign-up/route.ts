import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { setDemoSessionCookie } from "@/lib/auth/demo-session";
import { hashPassword } from "@/lib/auth/password";
import { enforceApiRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getOrCreateRequestId, jsonWithRequestId } from "@/lib/api-observability";

const bodySchema = z.object({
  nickname: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const limited = await enforceApiRateLimit(req, {
    key: "auth-sign-up",
    limit: 5,
    window: "1 m",
  });
  if (limited) {
    limited.headers.set("X-Request-Id", requestId);
    return limited;
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    auditLog("warn", "auth.sign_up.invalid_payload", { requestId });
    return jsonWithRequestId(
      { error: "Geçersiz veri", issues: parsed.error.flatten() },
      { status: 400 },
      requestId
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const exists = await db.user.findFirst({ where: { email } });
  if (exists) {
    auditLog("warn", "auth.sign_up.duplicate_email", { requestId, email });
    return jsonWithRequestId({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 }, requestId);
  }

  const user = await db.user.create({
    data: {
      clerkId: `demo_${crypto.randomUUID()}`,
      email,
      username: parsed.data.nickname.trim(),
      passwordHash: hashPassword(parsed.data.password),
      role: "USER",
    },
  });

  await setDemoSessionCookie(user.id);
  auditLog("info", "auth.sign_up.success", { requestId, userId: user.id, email });
  return jsonWithRequestId({ ok: true, userId: user.id }, undefined, requestId);
}
