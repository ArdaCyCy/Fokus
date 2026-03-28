/**
 * Merkezi hata kaydı. Sentry kurulduğunda NEXT_PUBLIC_SENTRY_DSN ve SENTRY_DSN ile genişletilebilir.
 * Şimdilik yapılandırılmış JSON log (log toplama araçlarına uygun).
 */
type CaptureContext = Record<string, unknown>;

export function captureAppError(err: unknown, context?: CaptureContext): void {
  const payload = {
    ts: new Date().toISOString(),
    event: "app_error",
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    ...context,
  };
  console.error(JSON.stringify(payload));
}
