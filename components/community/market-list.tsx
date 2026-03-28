"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Listing = {
  id: string;
  priceCents: number;
  inventoryItem: {
    name: string;
    game: { title: string } | null;
  };
  seller: { username: string | null };
};

export function MarketList() {
  const [items, setItems] = useState<Listing[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/community/market", { cache: "no-store" });
    const json = await res.json();
    setItems(json.listings ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function buy(listingId: string) {
    setMsg(null);
    const res = await fetch("/api/community/market", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg(json.error ?? "Satın alma başarısız.");
      return;
    }
    setMsg("Satın alma başarılı.");
    await load();
  }

  return (
    <div className="space-y-4">
      {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">{item.inventoryItem.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{item.inventoryItem.game?.title ?? "Fokus"}</p>
              <p className="text-muted-foreground">Satici: {item.seller.username ?? "kullanici"}</p>
              <p className="font-medium">₺{(item.priceCents / 100).toLocaleString("tr-TR")}</p>
              <Button className="w-full" onClick={() => void buy(item.id)}>
                Satın al
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">Aktif ilan yok.</p> : null}
    </div>
  );
}
