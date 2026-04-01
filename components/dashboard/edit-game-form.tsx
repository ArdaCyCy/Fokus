"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type EditGameInitial = {
  id: string;
  title: string;
  shortDescription: string | null;
  descriptionMd: string | null;
  priceCents: number;
  coverImageUrl: string | null;
  parentGameId: string | null;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";
  platformsJson: string;
  systemRequirementsJson: string;
  screenshotsText: string;
  isTurkishMade: boolean;
  categorySlugs: string[];
};

type DevGameOption = { id: string; title: string };
type CatRow = { slug: string; name: string };

function statusLabel(s: EditGameInitial["status"]): string {
  if (s === "PUBLISHED") return "Yayında";
  if (s === "PENDING") return "Onay bekliyor";
  if (s === "REJECTED") return "Reddedildi — düzenleyip tekrar gönderebilirsin";
  return "Taslak";
}

export function EditGameForm({ initial }: { initial: EditGameInitial }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseGames, setBaseGames] = useState<DevGameOption[]>([]);
  const [categories, setCategories] = useState<CatRow[]>([]);
  const [form, setForm] = useState({
    title: initial.title,
    shortDescription: initial.shortDescription ?? "",
    descriptionMd: initial.descriptionMd ?? "",
    priceTl: String(initial.priceCents / 100),
    coverImageUrl: initial.coverImageUrl ?? "",
    parentGameId: initial.parentGameId ?? "",
    platformsJson: initial.platformsJson,
    systemRequirementsJson: initial.systemRequirementsJson,
    screenshotsText: initial.screenshotsText,
    isTurkishMade: initial.isTurkishMade,
  });
  const [selectedCats, setSelectedCats] = useState<string[]>(
    initial.categorySlugs,
  );

  useEffect(() => {
    let ok = true;
    fetch("/api/developer/games", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { games?: { id: string; title: string }[] }) => {
        if (!ok) return;
        setBaseGames(
          (j.games ?? [])
            .filter((g) => g.id !== initial.id)
            .map((g) => ({ id: g.id, title: g.title })),
        );
      })
      .catch(() => {});
    fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { categories?: CatRow[] }) => {
        if (!ok) return;
        setCategories(j.categories ?? []);
      })
      .catch(() => {});
    return () => {
      ok = false;
    };
  }, [initial.id]);

  function toggleCat(slug: string) {
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const priceCents = Math.round(Number(form.priceTl) * 100);
      const parentRaw = form.parentGameId.trim();

      let platforms: unknown;
      try {
        platforms = JSON.parse(form.platformsJson || "{}");
      } catch {
        throw new Error("Platform alanı geçerli JSON olmalı.");
      }
      let systemRequirements: unknown;
      try {
        systemRequirements = JSON.parse(form.systemRequirementsJson || "{}");
      } catch {
        throw new Error("Sistem gereksinimleri geçerli JSON olmalı.");
      }

      const lines = form.screenshotsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const u of lines) {
        try {
          new URL(u);
        } catch {
          throw new Error(`Geçersiz ekran görüntüsü URL: ${u}`);
        }
      }

      const res = await fetch("/api/developer/games", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: initial.id,
          title: form.title,
          shortDescription: form.shortDescription,
          descriptionMd: form.descriptionMd,
          priceCents,
          coverImageUrl: form.coverImageUrl,
          parentGameId: parentRaw === "" ? null : parentRaw,
          categorySlugs: selectedCats,
          platforms,
          systemRequirements,
          screenshotUrls: lines,
          isTurkishMade: form.isTurkishMade,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Kaydedilemedi.");
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
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{statusLabel(initial.status)}</Badge>
        <Link
          href="/dashboard/games"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Oyunlarıma dön
        </Link>
      </div>

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
      </div>

      {categories.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Kategoriler</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <label
                key={c.slug}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-white/[0.08] bg-background/80 px-2 py-1 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selectedCats.includes(c.slug)}
                  onChange={() => toggleCat(c.slug)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={form.isTurkishMade}
          onChange={(e) =>
            setForm((p) => ({ ...p, isTurkishMade: e.target.checked }))
          }
        />
        Türk yapımı
      </label>

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

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          Ekran görüntüsü URL’leri (satır başına bir)
        </label>
        <textarea
          className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs"
          rows={4}
          value={form.screenshotsText}
          onChange={(e) =>
            setForm((p) => ({ ...p, screenshotsText: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          Platformlar (JSON)
        </label>
        <textarea
          className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs"
          rows={3}
          value={form.platformsJson}
          onChange={(e) =>
            setForm((p) => ({ ...p, platformsJson: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          Sistem gereksinimleri (JSON)
        </label>
        <textarea
          className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs"
          rows={5}
          value={form.systemRequirementsJson}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              systemRequirementsJson: e.target.value,
            }))
          }
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button disabled={loading} type="submit">
          {loading ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
        </Button>
        <Button variant="outline" type="button" asChild>
          <Link href="/dashboard/games">İptal</Link>
        </Button>
      </div>
    </form>
  );
}
