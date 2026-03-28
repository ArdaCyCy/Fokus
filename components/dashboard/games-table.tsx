"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Status = "DRAFT" | "PENDING" | "PUBLISHED";

type ApiDeveloperGameRow = {
  id: string;
  title: string;
  slug: string;
  status: Status;
  priceCents: number;
  viewCount: number;
  updatedAt: string;
  parentGameId: string | null;
};

type DisplayRow = {
  id: string;
  title: string;
  status: Status;
  price: string;
  views: number;
  updatedAt: string;
  slug: string;
  parentGameId: string | null;
};

function statusLabel(status: Status): string {
  if (status === "PUBLISHED") return "Yayında";
  if (status === "PENDING") return "Onay bekliyor";
  return "Taslak";
}

function statusVariant(status: Status): "success" | "secondary" | "outline" {
  if (status === "PUBLISHED") return "success";
  if (status === "PENDING") return "secondary";
  return "outline";
}

export function DashboardGamesTable() {
  const [tab, setTab] = useState<"all" | Status>("all");
  const [raw, setRaw] = useState<ApiDeveloperGameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingParent, setSavingParent] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/developer/games", { cache: "no-store" });
      const json = (await res.json()) as { games?: ApiDeveloperGameRow[] };
      setRaw(json.games ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const items: DisplayRow[] = useMemo(
    () =>
      raw.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        price: `₺${(item.priceCents / 100).toLocaleString("tr-TR")}`,
        views: item.viewCount,
        updatedAt: new Date(item.updatedAt).toLocaleDateString("tr-TR"),
        slug: item.slug,
        parentGameId: item.parentGameId,
      })),
    [raw]
  );

  const data = useMemo(
    () => (tab === "all" ? items : items.filter((r) => r.status === tab)),
    [items, tab]
  );

  async function updateStatus(gameId: string, status: "DRAFT" | "PENDING") {
    await fetch("/api/developer/games", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, status }),
    });
    await load();
  }

  async function updateParentGame(gameId: string, parentGameId: string | null) {
    setSavingParent(gameId);
    try {
      await fetch("/api/developer/games", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, parentGameId }),
      });
      await load();
    } finally {
      setSavingParent(null);
    }
  }

  async function removeGame(gameId: string) {
    await fetch(`/api/developer/games?gameId=${encodeURIComponent(gameId)}`, { method: "DELETE" });
    await load();
  }

  return (
    <Card className="bg-card/70">
      <CardHeader>
        <CardTitle>Oyunlarım</CardTitle>
        <CardDescription>
          DLC için ana oyunu aşağıdan seçebilir, durumu ve taslakları yönetebilirsin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <p className="text-sm text-muted-foreground">Yükleniyor…</p> : null}
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | Status)}>
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="DRAFT">Taslak</TabsTrigger>
            <TabsTrigger value="PENDING">Onay</TabsTrigger>
            <TabsTrigger value="PUBLISHED">Yayında</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oyun</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Ana oyun (DLC)</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Görüntülenme</TableHead>
                  <TableHead>Güncelleme</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <select
                        className="h-9 w-full max-w-[220px] rounded-md border border-white/[0.08] bg-background/80 px-2 text-xs text-foreground"
                        disabled={savingParent === row.id}
                        value={row.parentGameId ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          void updateParentGame(row.id, v === "" ? null : v);
                        }}
                      >
                        <option value="">— Yok (bağımsız başlık) —</option>
                        {raw
                          .filter((g) => g.id !== row.id)
                          .map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.title}
                            </option>
                          ))}
                      </select>
                    </TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.views.toLocaleString("tr-TR")}</TableCell>
                    <TableCell>{row.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void updateStatus(row.id, row.status === "DRAFT" ? "PENDING" : "DRAFT")
                          }
                        >
                          {row.status === "DRAFT" ? "Onaya gönder" : "Taslağa al"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void removeGame(row.id)}
                        >
                          Sil
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
