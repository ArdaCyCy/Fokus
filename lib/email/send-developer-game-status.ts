import { auditLog } from "@/lib/api-observability";
import { db } from "@/lib/db";

/**
 * Admin oyun onayı / red sonrası geliştiriciye e-posta (RESEND_* tanımlıysa).
 */
export async function sendDeveloperGameStatusEmail(params: {
  gameId: string;
  approved: boolean;
  requestId: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) return;

  const row = await db.game.findUnique({
    where: { id: params.gameId },
    select: {
      title: true,
      developerSlug: true,
    },
  });
  if (!row?.developerSlug) return;

  const dev = await db.user.findUnique({
    where: { id: row.developerSlug },
    select: { email: true, username: true },
  });
  const to = dev?.email?.trim();
  if (!to) return;

  const subject = params.approved
    ? `Fokus — "${row.title}" onaylandı`
    : `Fokus — "${row.title}" reddedildi`;
  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
<p>Merhaba ${dev?.username ?? "Geliştirici"},</p>
<p><strong>${row.title}</strong> başlıklı oyunun ${
    params.approved
      ? "yayına alındı (yayındaysa mağazada görünür)."
      : "şu an reddedildi. Panelden düzenleyip tekrar onaya gönderebilirsin."
  }</p>
<p style="color:#666;font-size:12px;margin-top:32px">Bu e-posta otomatik gönderilmiştir.</p>
</body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      const t = await res.text();
      auditLog("warn", "resend_developer_status_failed", {
        requestId: params.requestId,
        status: res.status,
        body: t.slice(0, 500),
      });
    }
  } catch (e) {
    auditLog("warn", "resend_developer_status_error", {
      requestId: params.requestId,
      error: String(e),
    });
  }
}
