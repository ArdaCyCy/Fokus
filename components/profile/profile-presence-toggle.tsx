"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { ownPresenceBadge } from "@/lib/social/presence";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  appearOffline: boolean;
  lastSeenAt: Date | null;
};

export function ProfilePresenceToggle({ appearOffline, lastSeenAt }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const presence = ownPresenceBadge({ appearOffline, lastSeenAt });

  async function setMode(next: boolean) {
    setPending(true);
    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appearOffline: next }),
      });
      if (res.ok) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          className="h-auto gap-1 rounded-full px-0 py-0 hover:bg-transparent"
          aria-label="Çevrim durumunu değiştir"
        >
          <Badge
            variant={presence.online ? "default" : "secondary"}
            className={cn(
              "cursor-pointer text-[10px] font-normal uppercase tracking-wide",
              presence.online && "bg-success text-success-foreground",
              presence.stealth && "border border-amber-500/40 bg-amber-500/10 text-amber-100"
            )}
          >
            {presence.text}
          </Badge>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Çevrim durumu
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={cn("cursor-pointer", !appearOffline && "bg-accent/10")}
          disabled={pending}
          onClick={() => void setMode(false)}
        >
          <span className="text-success">●</span>
          <span className="pl-2">Çevrim içi göster</span>
          {!appearOffline ? (
            <span className="ml-auto text-xs text-muted-foreground">Seçili</span>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("cursor-pointer", appearOffline && "bg-accent/10")}
          disabled={pending}
          onClick={() => void setMode(true)}
        >
          <span className="text-muted-foreground">○</span>
          <span className="pl-2">Gizli mod (çevrim dışı görün)</span>
          {appearOffline ? (
            <span className="ml-auto text-xs text-muted-foreground">Seçili</span>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <p className="px-2 pb-2 text-[10px] leading-snug text-muted-foreground">
          Gizli moddayken arkadaşların seni çevrim dışı görür; site kullanımın
          etkilenmez.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
