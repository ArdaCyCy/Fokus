"use client";

import { useState } from "react";

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
            body: JSON.stringify({ ...form, password: password || undefined }),
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
      <div className="grid gap-4 md:grid-cols-2">
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
        <label className="space-y-1">
          <span className="text-sm text-muted-foreground">Profil fotoğrafı URL</span>
          <input
            className={inputClass}
            value={form.imageUrl}
            onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
            placeholder="https://..."
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-muted-foreground">Profil çerçevesi</span>
          <input
            className={inputClass}
            value={form.profileFrame}
            onChange={(e) => setForm((p) => ({ ...p, profileFrame: e.target.value }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-muted-foreground">Profil arka plan URL</span>
          <input
            className={inputClass}
            value={form.profileBackground}
            onChange={(e) => setForm((p) => ({ ...p, profileBackground: e.target.value }))}
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
