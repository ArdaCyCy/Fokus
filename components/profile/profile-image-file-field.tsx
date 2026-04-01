"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Kind = "avatar" | "background";

export function ProfileImageFileField({
  label,
  kind,
  currentUrl,
  previewClassName,
}: {
  label: string;
  kind: Kind;
  currentUrl: string;
  previewClassName?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.set("kind", kind);
      fd.set("file", file);
      const res = await fetch("/api/account/profile-image", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Yükleme başarısız.");
      const url = data.url;
      if (!url) throw new Error("Yanıtta URL yok.");

      const patch = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "avatar" ? { imageUrl: url } : { profileBackground: url },
        ),
      });
      const pj = (await patch.json().catch(() => ({}))) as { error?: string };
      if (!patch.ok) throw new Error(pj.error ?? "Kaydedilemedi.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt=""
            className={cn(
              "rounded-md border border-white/[0.08] object-cover",
              previewClassName ??
                (kind === "avatar" ? "size-14 shrink-0" : "h-20 w-full max-w-xs shrink-0"),
            )}
          />
        ) : null}
        <label className="inline-flex cursor-pointer flex-col gap-1">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="max-w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-accent file:px-2 file:py-1.5 file:text-xs file:font-medium file:text-accent-foreground hover:file:bg-accent/90"
            disabled={busy}
            onChange={(e) => void onChange(e)}
          />
          {busy ? (
            <span className="text-[11px] text-muted-foreground">Yükleniyor…</span>
          ) : null}
          {err ? (
            <span className="text-[11px] text-destructive">{err}</span>
          ) : null}
        </label>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Bilgisayarından seç: JPEG, PNG, WebP veya GIF — en fazla 2 MB.
      </p>
    </div>
  );
}
