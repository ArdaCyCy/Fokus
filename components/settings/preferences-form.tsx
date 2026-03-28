"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Initial = {
  language: string;
  appearOffline: boolean;
  storePreferences: {
    hideMature?: boolean;
    autoPlayVideos?: boolean;
  };
  notificationSettings: {
    emailNews?: boolean;
    emailSales?: boolean;
    desktop?: boolean;
  };
};

const fieldBox =
  "grid gap-2 rounded-lg border border-white/[0.08] bg-background/40 p-3 text-sm";

export function PreferencesForm({ initial }: { initial: Initial }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/account/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setMessage(
      res.ok ? "Tercihler kaydedildi." : (json.error ?? "Kaydedilemedi.")
    );
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <label className="space-y-1">
        <span className="text-sm text-muted-foreground">Dil</span>
        <select
          className="h-10 w-full rounded-md border border-white/[0.08] bg-background/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          value={form.language}
          onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
      </label>

      <div className={fieldBox}>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Çevrim durumu ve gizlilik
        </p>
        <label className="flex items-center justify-between gap-3">
          <span className="leading-snug">
            Gizli mod (arkadaş listesinde çevrim dışı görün)
          </span>
          <input
            type="checkbox"
            className="size-4 accent-[hsl(var(--accent))]"
            checked={Boolean(form.appearOffline)}
            onChange={(e) =>
              setForm((p) => ({ ...p, appearOffline: e.target.checked }))
            }
          />
        </label>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Profilindeki rozetle de anında değiştirebilirsin. Aynı ayar buradan
          kaydedilir.
        </p>
      </div>

      <div className={fieldBox}>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Mağaza
        </p>
        <label className="flex items-center justify-between gap-3">
          <span>Olgun içeriği gizle</span>
          <input
            type="checkbox"
            className="size-4 accent-[hsl(var(--accent))]"
            checked={Boolean(form.storePreferences.hideMature)}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                storePreferences: {
                  ...p.storePreferences,
                  hideMature: e.target.checked,
                },
              }))
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>Mağaza videolarını otomatik oynat</span>
          <input
            type="checkbox"
            className="size-4 accent-[hsl(var(--accent))]"
            checked={Boolean(form.storePreferences.autoPlayVideos)}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                storePreferences: {
                  ...p.storePreferences,
                  autoPlayVideos: e.target.checked,
                },
              }))
            }
          />
        </label>
      </div>

      <div className={fieldBox}>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Bildirimler
        </p>
        <label className="flex items-center justify-between gap-3">
          <span>E-posta ile haberler</span>
          <input
            type="checkbox"
            className="size-4 accent-[hsl(var(--accent))]"
            checked={Boolean(form.notificationSettings.emailNews)}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                notificationSettings: {
                  ...p.notificationSettings,
                  emailNews: e.target.checked,
                },
              }))
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>İndirim e-postaları</span>
          <input
            type="checkbox"
            className="size-4 accent-[hsl(var(--accent))]"
            checked={Boolean(form.notificationSettings.emailSales)}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                notificationSettings: {
                  ...p.notificationSettings,
                  emailSales: e.target.checked,
                },
              }))
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>Masaüstü bildirimleri</span>
          <input
            type="checkbox"
            className="size-4 accent-[hsl(var(--accent))]"
            checked={Boolean(form.notificationSettings.desktop)}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                notificationSettings: {
                  ...p.notificationSettings,
                  desktop: e.target.checked,
                },
              }))
            }
          />
        </label>
      </div>

      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      <Button disabled={loading} onClick={() => void save()}>
        {loading ? "Kaydediliyor…" : "Tercihleri kaydet"}
      </Button>
    </div>
  );
}
