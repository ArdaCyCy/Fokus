"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "fokus_cookie_consent_v1";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      setVisible(!window.localStorage.getItem(STORAGE_KEY));
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Çerez bildirimi"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border/70 bg-card/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md md:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Deneyimi iyileştirmek için zorunlu ve isteğe bağlı çerezler kullanıyoruz. Ayrıntılar{" "}
          <Link href="/about/cookies" className="text-accent underline underline-offset-2">
            çerez politikasında
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              try {
                window.localStorage.setItem(STORAGE_KEY, "essential");
              } catch {
                /* ignore */
              }
              setVisible(false);
            }}
          >
            Yalnızca gerekli
          </Button>
          <Button
            size="sm"
            onClick={() => {
              try {
                window.localStorage.setItem(STORAGE_KEY, "all");
              } catch {
                /* ignore */
              }
              setVisible(false);
            }}
          >
            Kabul et
          </Button>
        </div>
      </div>
    </div>
  );
}
