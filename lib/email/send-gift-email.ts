import { auditLog } from "@/lib/api-observability";
import { formatTryFromCents } from "@/lib/format/currency";
import { getPublicSiteUrl } from "@/lib/site-url";

export async function sendGiftEmail(params: {
  toEmail: string;
  gameTitle: string;
  amountCents: number;
  claimPath: string;
  senderName?: string | null;
  note?: string | null;
  requestId: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) return;

  const to = params.toEmail.trim().toLowerCase();
  if (!to) return;
  const sender = params.senderName?.trim() || "Bir arkadasin";
  const claimUrl = `${getPublicSiteUrl()}${params.claimPath}`;

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
<p>Merhaba,</p>
<p><strong>${escapeHtml(sender)}</strong> sana <strong>${escapeHtml(params.gameTitle)}</strong> oyununu hediye etti.</p>
<p>Tutar: ${escapeHtml(formatTryFromCents(params.amountCents))}</p>
${params.note ? `<p>Not: ${escapeHtml(params.note)}</p>` : ""}
<p><a href="${claimUrl}">Hediyeni claim et</a></p>
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
        subject: `Fokus hediyesi: ${params.gameTitle}`,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      auditLog("warn", "email.gift_failed", {
        requestId: params.requestId,
        status: res.status,
        body: text.slice(0, 200),
      });
    }
  } catch (err) {
    auditLog("warn", "email.gift_error", {
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

