import { auditLog } from "@/lib/api-observability";
import { getPublicSiteUrl } from "@/lib/site-url";

export async function sendWelcomeEmail(params: {
  email: string;
  username?: string | null;
  requestId: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) return;

  const to = params.email.trim().toLowerCase();
  if (!to) return;
  const name = params.username?.trim() || "Oyuncu";

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
<p>Merhaba ${escapeHtml(name)},</p>
<p>Fokus'a hos geldin. Hesabin hazir!</p>
<p>Magazayi kesfetmek icin: <a href="${getPublicSiteUrl()}/games">/games</a></p>
<p style="color:#666;font-size:12px;margin-top:32px">Bu e-posta otomatik gonderilmistir.</p>
</body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Fokus'a hos geldin",
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      auditLog("warn", "email.welcome_failed", {
        requestId: params.requestId,
        status: res.status,
        body: text.slice(0, 200),
      });
    }
  } catch (err) {
    auditLog("warn", "email.welcome_error", {
      requestId: params.requestId,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

