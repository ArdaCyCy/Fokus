"use client";

import { useMemo, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QueueItem = {
  id: string;
  game: { title: string };
  progress: number;
  speedMbps: number;
  status: "DOWNLOADING" | "PAUSED" | "COMPLETED" | "QUEUED";
};

const INITIAL: QueueItem[] = [];

export function DownloadQueue() {
  const [items, setItems] = useState<QueueItem[]>(INITIAL);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/downloads", { cache: "no-store" });
    const json = await res.json();
    setItems(json.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function action(downloadId: string, kind: "toggle" | "cancel" | "tick") {
    await fetch("/api/downloads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ downloadId, action: kind }),
    });
    await load();
  }

  const totalProgress = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round(items.reduce((acc, i) => acc + i.progress, 0) / items.length);
  }, [items]);

  return (
    <Card className="bg-card/70">
      <CardHeader>
        <CardTitle>İndirmeler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{item.game.title}</p>
              <div className="inline-flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => void action(item.id, "toggle")}
                >
                  {item.status === "PAUSED" ? <Play className="size-4" /> : <Pause className="size-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => void action(item.id, "cancel")}
                >
                  <X className="size-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void action(item.id, "tick")}>
                  +%12
                </Button>
              </div>
            </div>
            <div className="mb-2 h-2 w-full rounded bg-muted">
              <div className="h-2 rounded bg-accent" style={{ width: `${item.progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              %{item.progress} · {item.status === "PAUSED" ? "Duraklatildi" : `${item.speedMbps.toFixed(1)} Mbps`}
            </p>
          </div>
        ))}
        {loading ? <p className="text-xs text-muted-foreground">Kuyruk yukleniyor...</p> : null}
        {!loading && items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aktif indirme yok. Kutuphaneden indirmeye ekle.</p>
        ) : null}
        <p className="text-xs text-muted-foreground">Toplam ilerleme: %{totalProgress}</p>
      </CardContent>
    </Card>
  );
}
