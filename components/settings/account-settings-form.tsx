"use client";

import { useEffect, useState } from "react";

import { ProfileImageFileField } from "@/components/profile/profile-image-file-field";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-10 w-full rounded-md border border-white/[0.08] bg-background/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

type Initial = {
  username: string;
  email: string;
  imageUrl: string;
  profileFrame: string;
  profileBackground: string;
};

export function AccountSettingsForm({ initial }: { initial: Initial }) {
  const [form, setForm] = useState(initial);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setForm((p) => ({
      ...p,
      imageUrl: initial.imageUrl,
      profileBackground: initial.profileBackground,
    }));
  }, [initial.imageUrl, initial.profileBackground]);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
          const res = await fetch("/api/account/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: form.username,
              email: form.email,
              profileFrame: form.profileFrame,
              password: password || undefined,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "Kaydedilemedi");
          setPassword("");
          setMessage("Ayarlar kaydedildi.");
        } catch (err) {
          setMessage(err instanceof Error ? err.message : "Kaydedilemedi");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 md:col-span-2">
          <ProfileImageFileField
            label="Profil fotoğrafı"
            kind="avatar"
            currentUrl={form.imageUrl}
          />
          <ProfileImageFileField
            label="Profil arka planı"
            kind="background"
            currentUrl={form.profileBackground}
            previewClassName="h-24 w-full max-w-md rounded-md border border-white/[0.08] object-cover"
          />
        </div>
        <label className="space-y-1">
          <span className="text-sm text-muted-foreground">Takma ad</span>
          <input
            className={inputClass}
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-muted-foreground">E-posta</span>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm text-muted-foreground">Profil çerçevesi</span>
          <input
            className={inputClass}
            value={form.profileFrame}
            onChange={(e) =>
              setForm((p) => ({ ...p, profileFrame: e.target.value }))
            }
          />
        </label>
      </div>
      <label className="space-y-1">
        <span className="text-sm text-muted-foreground">Yeni parola (isteğe bağlı)</span>
        <input
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
        />
      </label>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </form>
  );
}
