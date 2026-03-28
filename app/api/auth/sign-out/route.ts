import { clearDemoSessionCookie } from "@/lib/auth/demo-session";
import { auditLog, jsonWithRequestId } from "@/lib/api-observability";

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  await clearDemoSessionCookie();
  auditLog("info", "auth.sign_out.success", { requestId });
  return jsonWithRequestId({ ok: true }, undefined, requestId);
}
