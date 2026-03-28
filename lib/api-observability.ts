import { NextResponse } from "next/server";

type AuditLevel = "info" | "warn" | "error";

export function getOrCreateRequestId(req: Request): string {
  const existing = req.headers.get("x-request-id")?.trim();
  if (existing) return existing;
  return crypto.randomUUID();
}

export function jsonWithRequestId(
  body: unknown,
  init: ResponseInit | undefined,
  requestId: string
): NextResponse {
  const res = NextResponse.json(body, init);
  res.headers.set("X-Request-Id", requestId);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export function auditLog(level: AuditLevel, event: string, details: Record<string, unknown>): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...details,
  };
  // Structured logs make it easier to filter auth/payment events in log tools.
  console[level](JSON.stringify(payload));
}
