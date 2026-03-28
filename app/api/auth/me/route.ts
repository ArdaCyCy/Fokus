import { getOptionalAppUser } from "@/lib/auth/app-user";
import { auditLog, jsonWithRequestId } from "@/lib/api-observability";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const user = await getOptionalAppUser();
  if (!user) {
    return jsonWithRequestId({ user: null }, undefined, requestId);
  }
  const unreadNotificationCount = await db.notification.count({
    where: { userId: user.id, readAt: null },
  });
  auditLog("info", "auth.me.success", { requestId, userId: user.id });
  return jsonWithRequestId(
    {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
        role: user.role,
        walletBalanceCents: user.walletBalanceCents,
        unreadNotificationCount,
      },
    },
    undefined,
    requestId
  );
}
