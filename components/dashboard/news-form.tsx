"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type GameOption = { id: string; title: string };

export function NewsForm({ games }: { games: GameOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    body: "",
    gameId: "",
    kind: "NEWS" as "PATCH_NOTE" | "EVENT" | "NEWS",
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        gameId: form.gameId || undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "Haber yayınlanamadı.");
      setLoading(false);
      return;
    }
    setForm({ title: "", body: "", gameId: "", kind: "NEWS" });
    setMessage("Haber yayına alındı.");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        placeholder="Başlık"
        value={form.title}
        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        required
      />
      <textarea
        className="w-full rounded-md border border-border bg-background p-3 text-sm"
        rows={6}
        placeholder="İçerik"
        value={form.body}
        onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
        required
      />
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          value={form.kind}
          onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value as "PATCH_NOTE" | "EVENT" | "NEWS" }))}
        >
          <option value="NEWS">Haber</option>
          <option value="PATCH_NOTE">Patch Note</option>
          <option value="EVENT">Etkinlik</option>
        </select>
        <select
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          value={form.gameId}
          onChange={(e) => setForm((p) => ({ ...p, gameId: e.target.value }))}
        >
          <option value="">Platform Geneli</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Yayimlaniyor..." : "Haberi Yayimla"}
      </Button>
    </form>
  );
}
