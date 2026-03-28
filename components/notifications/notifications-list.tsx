"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Item = {
  id: string;
  title: string;
  createdAt: string;
  readAt: string | null;
};

export function NotificationsList() {
  const [items, setItems] = useState<Item[]>([]);

  async function load() {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    const json = await res.json();
    setItems(json.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function mark(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    await load();
  }

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    await load();
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" onClick={() => void markAll()}>
        Tumunu Okundu Isaretle
      </Button>
      {items.map((n) => (
        <Card key={n.id} className="bg-card/70">
          <CardHeader className="py-3">
            <CardTitle className="text-base">{n.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2 pb-4 text-xs text-muted-foreground">
            <span>{new Date(n.createdAt).toLocaleString("tr-TR")}</span>
            {n.readAt ? (
              <span>Okundu</span>
            ) : (
              <Button size="sm" variant="outline" onClick={() => void mark(n.id)}>
                Okundu
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
      {items.length === 0 ? <p className="text-sm text-muted-foreground">Bildirim yok.</p> : null}
    </div>
  );
}
