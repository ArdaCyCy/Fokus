import { auditLog } from "@/lib/api-observability";
import { formatTryFromCents } from "@/lib/format/currency";
import { db } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";

type Line = { title: string; chargedCents: number };

/**
 * Resend API ile satın alma özeti (RESEND_API_KEY yoksa sessizce atlanır).
 */
export async function sendPurchaseReceiptEmail(params: {
  userId: string;
  lines: Line[];
  totalCents: number;
  currency: string;
  requestId: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) return;

  const user = await db.user.findUnique({
    where: { id: params.userId },
    select: { email: true, username: true },
  });
  const to = user?.email?.trim();
  if (!to) return;

  const name = user?.username ?? "Oyuncu";
  const cur = params.currency.toLowerCase();
  const totalLabel = formatMinor(params.totalCents, cur);

  const rows = params.lines
    .map(
      (l) =>
        `<tr><td>${escapeHtml(l.title)}</td><td style="text-align:right">${escapeHtml(formatMinor(l.chargedCents, cur))}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
<p>Merhaba ${escapeHtml(name)},</p>
<p>Fokus üzerindeki satın alman onaylandı.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<thead><tr><th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">Ürün</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:8px">Tutar</th></tr></thead>
<tbody>${rows}</tbody></table>
<p><strong>Toplam:</strong> ${escapeHtml(totalLabel)}</p>
<p>Oyunları <a href="${getPublicSiteUrl()}/library">kütüphanenden</a> indirebilirsin.</p>
<p style="color:#666;font-size:12px;margin-top:32px">Bu e-posta otomatik gönderilmiştir.</p>
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
        subject: "Fokus — Satın alma onayı",
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      auditLog("warn", "email.resend_failed", {
        requestId: params.requestId,
        status: res.status,
        body: text.slice(0, 200),
      });
    }
  } catch (err) {
    auditLog("warn", "email.resend_error", {
      requestId: params.requestId,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

function formatMinor(cents: number, currencyLower: string): string {
  if (currencyLower === "try") return formatTryFromCents(cents);
  return `${(cents / 100).toFixed(2)} ${currencyLower.toUpperCase()}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
