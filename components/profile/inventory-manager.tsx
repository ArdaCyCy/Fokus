"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Item = {
  id: string;
  name: string;
  game: { title: string } | null;
  listing: { id: string; priceCents: number; soldAt: string | null } | null;
};

export function InventoryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/inventory", { cache: "no-store" });
    const json = await res.json();
    setItems(json.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function list(itemId: string) {
    setMessage(null);
    const res = await fetch("/api/community/market", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventoryItemId: itemId, priceCents: 990 }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "Listeleme başarısız.");
      return;
    }
    setMessage("Pazara eklendi.");
    await load();
  }

  async function unlist(listingId: string) {
    await fetch(`/api/community/market?listingId=${encodeURIComponent(listingId)}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-3">
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {items.map((item) => (
        <Card key={item.id} className="bg-card/70">
          <CardHeader className="py-3">
            <CardTitle className="text-base">{item.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">{item.game?.title ?? "Fokus"}</p>
              <p className="text-muted-foreground">
                {item.listing ? `İlanda: ₺${(item.listing.priceCents / 100).toLocaleString("tr-TR")}` : "İlanda değil"}
              </p>
            </div>
            {item.listing ? (
              <Button variant="outline" onClick={() => void unlist(item.listing!.id)}>
                Ilani Kaldir
              </Button>
            ) : (
              <Button onClick={() => void list(item.id)}>Pazarda Listele</Button>
            )}
          </CardContent>
        </Card>
      ))}
      {items.length === 0 ? <p className="text-sm text-muted-foreground">Envanter bos.</p> : null}
    </div>
  );
}
