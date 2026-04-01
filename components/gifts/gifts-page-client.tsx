"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GameRow = { id: string; title: string; priceCents: number };
type SentGiftRow = {
  id: string;
  claimToken: string;
  recipientEmail: string;
  status: "PENDING" | "CLAIMED" | "CANCELED";
  createdAt: string | Date;
  game: { title: string };
};
type ReceivedGiftRow = {
  id: string;
  claimToken: string;
  recipientEmail: string;
  status: "PENDING" | "CLAIMED" | "CANCELED";
  createdAt: string | Date;
  game: { title: string };
};

export function GiftsPageClient({
  games,
  sent,
  received,
}: {
  games: GameRow[];
  sent: SentGiftRow[];
  received: ReceivedGiftRow[];
}) {
  const [gameId, setGameId] = useState(games[0]?.id ?? "");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  const selectedPrice = useMemo(() => {
    const g = games.find((x) => x.id === gameId);
    return g ? g.priceCents : 0;
  }, [gameId, games]);

  async function submit() {
    setLoading(true);
    setError(null);
    setCreatedUrl(null);
    try {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          recipientEmail,
          note: note.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { error?: string; claimUrl?: string };
      if (!res.ok) throw new Error(json.error ?? "Hediye oluşturulamadı.");
      setCreatedUrl(json.claimUrl ?? null);
      setRecipientEmail("");
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Yeni hediye</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-sm">
            <span className="text-muted-foreground">Oyun</span>
            <select
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
            >
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} — ₺{(g.priceCents / 100).toLocaleString("tr-TR")}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Alıcı e-posta</span>
            <input
              type="email"
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="ornek@eposta.com"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Not (isteğe bağlı)</span>
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-background p-3 text-sm"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <p className="text-xs text-muted-foreground">
            Bu işlem cüzdandan <strong>₺{(selectedPrice / 100).toLocaleString("tr-TR")}</strong> düşer.
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {createdUrl ? (
            <p className="text-sm text-emerald-400">
              Hediye oluşturuldu:{" "}
              <Link href={createdUrl} className="underline">
                {createdUrl}
              </Link>
            </p>
          ) : null}
          <Button disabled={loading || !gameId || !recipientEmail} onClick={submit}>
            {loading ? "Gönderiliyor..." : "Hediye oluştur"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle>Gelen hediyeler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {received.length === 0 ? (
              <p className="text-muted-foreground">Bekleyen hediye yok.</p>
            ) : (
              received.map((g) => (
                <div key={g.id} className="rounded-md border border-white/[0.08] p-3">
                  <p className="font-medium">{g.game.title}</p>
                  <Link href={`/gifts/claim/${g.claimToken}`} className="text-accent hover:underline">
                    Claim et
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle>Gönderdiklerim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {sent.length === 0 ? (
              <p className="text-muted-foreground">Henüz hediye göndermedin.</p>
            ) : (
              sent.map((g) => (
                <div key={g.id} className="rounded-md border border-white/[0.08] p-3">
                  <p className="font-medium">{g.game.title}</p>
                  <p className="text-muted-foreground">{g.recipientEmail}</p>
                  <p className="text-xs text-muted-foreground">Durum: {g.status}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

