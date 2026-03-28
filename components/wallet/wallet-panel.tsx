"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Txn = {
  id: string;
  createdAt: string;
  description: string;
  amountCents: number;
};

export function WalletPanel() {
  const [balanceCents, setBalanceCents] = useState(0);
  const [rows, setRows] = useState<Txn[]>([]);
  const [allowDemoTopup, setAllowDemoTopup] = useState(false);
  const [iyzicoTopupAvailable, setIyzicoTopupAvailable] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/wallet", { cache: "no-store" });
    const json = await res.json();
    setBalanceCents(json.balanceCents ?? 0);
    setRows(json.transactions ?? []);
    setAllowDemoTopup(Boolean(json.allowDemoTopup));
    setIyzicoTopupAvailable(Boolean(json.iyzicoTopupAvailable));
  }

  useEffect(() => {
    void load();
  }, []);

  async function topup(amountCents: number) {
    setActionError(null);
    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountCents }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setActionError(json.error ?? "Yükleme başarısız.");
      return;
    }
    await load();
  }

  async function iyzicoTopup(amountCents: number) {
    setActionError(null);
    const res = await fetch("/api/checkout/wallet-topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountCents }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      url?: string;
      error?: string;
    };
    if (!res.ok || !json.url) {
      setActionError(json.error ?? "Ödeme oturumu açılamadı.");
      return;
    }
    window.location.href = json.url;
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-border bg-card/70 p-4 md:col-span-1">
        <p className="text-sm text-muted-foreground">Bakiye</p>
        <p className="mt-2 font-heading text-3xl font-bold">
          ₺{(balanceCents / 100).toLocaleString("tr-TR")}
        </p>
        <div className="mt-4 space-y-4">
          {actionError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {actionError}
            </p>
          ) : null}
          {iyzicoTopupAvailable ? (
            <div className="grid gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Kart ile yükleme (İyzico)
              </p>
              <Button onClick={() => void iyzicoTopup(10000)}>+ ₺100 yükle</Button>
              <Button variant="outline" onClick={() => void iyzicoTopup(25000)}>
                + ₺250 yükle
              </Button>
            </div>
          ) : null}
          {allowDemoTopup ? (
            <div className="grid gap-2 border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Test (ücretsiz)
              </p>
              <Button variant="secondary" onClick={() => void topup(10000)}>
                + ₺100 yükle (test)
              </Button>
              <Button variant="outline" onClick={() => void topup(25000)}>
                + ₺250 yükle (test)
              </Button>
            </div>
          ) : null}
          {!iyzicoTopupAvailable && !allowDemoTopup ? (
            <p className="text-sm text-muted-foreground">
              Bakiye yüklemek için{" "}
              <code className="rounded bg-muted px-1 text-xs">IYZICO_API_KEY</code> ve{" "}
              <code className="rounded bg-muted px-1 text-xs">IYZICO_SECRET_KEY</code>{" "}
              tanımlı olmalıdır. Ayrıntılar için depodaki{" "}
              <code className="rounded bg-muted px-1 text-xs">.env.example</code> dosyasına bak.
            </p>
          ) : null}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card/70 p-4 md:col-span-2">
        <p className="mb-3 font-medium">İşlem geçmişi</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.createdAt).toLocaleDateString("tr-TR")}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell className="text-right">
                  {r.amountCents >= 0 ? "+" : "-"}₺
                  {(Math.abs(r.amountCents) / 100).toLocaleString("tr-TR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
