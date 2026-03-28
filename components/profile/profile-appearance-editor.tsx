"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  initialAvatarUrl: string | null;
  initialBackgroundUrl: string | null;
};

export function ProfileAppearanceEditor({
  initialAvatarUrl,
  initialBackgroundUrl,
}: Props) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [backgroundUrl, setBackgroundUrl] = useState(
    initialBackgroundUrl ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl ?? "");
    setBackgroundUrl(initialBackgroundUrl ?? "");
  }, [initialAvatarUrl, initialBackgroundUrl]);

  async function save(partial: { imageUrl?: string; profileBackground?: string }) {
    if (!partial.imageUrl && !partial.profileBackground) {
      setError("En az bir URL girin.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((json as { error?: string }).error ?? "Kaydedilemedi.");
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="gap-1.5 text-xs"
        >
          <Pencil className="size-3.5" />
          Görünümü düzenle
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-3">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Profil fotoğrafı ve kapak için geçerli bir görsel URL&apos;si girin.
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Profil fotoğrafı URL
            </p>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              className="h-9 w-full rounded-md border border-white/[0.08] bg-background/60 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Kapak / arka plan URL
            </p>
            <input
              value={backgroundUrl}
              onChange={(e) => setBackgroundUrl(e.target.value)}
              placeholder="https://…"
              className="h-9 w-full rounded-md border border-white/[0.08] bg-background/60 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={saving}
            onClick={() =>
              void save({
                imageUrl: avatarUrl.trim() || undefined,
                profileBackground: backgroundUrl.trim() || undefined,
              })
            }
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
