"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type DevGameOption = { id: string; title: string };

export function UploadGameForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseGames, setBaseGames] = useState<DevGameOption[]>([]);
  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    descriptionMd: "",
    priceTl: "99",
    coverImageUrl: "",
    parentGameId: "",
  });

  useEffect(() => {
    let ok = true;
    fetch("/api/developer/games", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { games?: { id: string; title: string }[] }) => {
        if (!ok) return;
        setBaseGames(
          (j.games ?? []).map((g) => ({ id: g.id, title: g.title }))
        );
      })
      .catch(() => {});
    return () => {
      ok = false;
    };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const priceCents = Math.round(Number(form.priceTl) * 100);
      const parentGameId = form.parentGameId.trim() || undefined;
      const res = await fetch("/api/developer/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          shortDescription: form.shortDescription,
          descriptionMd: form.descriptionMd,
          priceCents,
          coverImageUrl: form.coverImageUrl,
          ...(parentGameId ? { parentGameId } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Oyun oluşturulamadı.");
      router.push("/dashboard/games");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm text-muted-foreground">
          Oyun adı
        </label>
        <input
          id="title"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="parentGameId"
          className="text-sm text-muted-foreground"
        >
          Ana oyun (DLC / eklenti ise)
        </label>
        <select
          id="parentGameId"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={form.parentGameId}
          onChange={(e) =>
            setForm((p) => ({ ...p, parentGameId: e.target.value }))
          }
        >
          <option value="">Yok — bağımsız oyun</option>
          {baseGames.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Sadece bu hesapta oluşturduğun oyunlar listelenir.
        </p>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="shortDescription"
          className="text-sm text-muted-foreground"
        >
          Kısa açıklama
        </label>
        <input
          id="shortDescription"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={form.shortDescription}
          onChange={(e) =>
            setForm((p) => ({ ...p, shortDescription: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="descriptionMd"
          className="text-sm text-muted-foreground"
        >
          Ayrıntılı açıklama (Markdown)
        </label>
        <textarea
          id="descriptionMd"
          className="w-full rounded-md border border-border bg-background p-3 text-sm"
          value={form.descriptionMd}
          onChange={(e) =>
            setForm((p) => ({ ...p, descriptionMd: e.target.value }))
          }
          rows={8}
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="priceTl" className="text-sm text-muted-foreground">
            Fiyat (TL)
          </label>
          <input
            id="priceTl"
            type="number"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            min={0}
            step="1"
            value={form.priceTl}
            onChange={(e) =>
              setForm((p) => ({ ...p, priceTl: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="coverImageUrl"
            className="text-sm text-muted-foreground"
          >
            Kapak görseli URL
          </label>
          <input
            id="coverImageUrl"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={form.coverImageUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, coverImageUrl: e.target.value }))
            }
            placeholder="https://..."
          />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button disabled={loading} type="submit">
        {loading ? "Kaydediliyor…" : "Oyunu oluştur"}
      </Button>
    </form>
  );
}
