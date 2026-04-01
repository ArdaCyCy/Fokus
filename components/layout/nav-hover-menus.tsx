"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, LayoutGrid, MessageCircle, Store, Users } from "lucide-react";

import { fallbackCoverWithWidth } from "@/lib/constants/covers";
import { cn } from "@/lib/utils";

type LibGame = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
};

function useHoverOpen(delay = 160) {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (t.current) clearTimeout(t.current);
    t.current = null;
  }, []);

  const onEnter = useCallback(() => {
    clear();
    setOpen(true);
  }, [clear]);

  const onLeave = useCallback(() => {
    clear();
    t.current = setTimeout(() => setOpen(false), delay);
  }, [clear, delay]);

  useEffect(() => () => clear(), [clear]);

  return { open, onEnter, onLeave };
}

const linkBase =
  "relative shrink-0 rounded px-2.5 py-2 text-[11px] font-medium uppercase tracking-wide transition-colors duration-200 sm:text-[12px] xl:px-3 xl:text-[13px]";

export function NavLibraryItem({ active }: { active: boolean }) {
  const { open, onEnter, onLeave } = useHoverOpen();
  const [games, setGames] = useState<LibGame[]>([]);

  useEffect(() => {
    if (!open) return;
    let ok = true;
    fetch("/api/nav/library-preview")
      .then((r) => r.json())
      .then((d) => {
        if (ok) setGames(d.games ?? []);
      })
      .catch(() => {});
    return () => {
      ok = false;
    };
  }, [open]);

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Link
        href="/library"
        className={cn(
          linkBase,
          active
            ? "bg-white/[0.07] text-foreground shadow-[inset_0_-2px_0_0_hsl(var(--accent))]"
            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
        )}
      >
        Kütüphane
      </Link>
      {open ? (
        <div className="absolute left-0 top-full z-[70] w-[min(calc(100vw-2rem),520px)] pt-1.5">
          <div className="rounded-xl border border-white/[0.1] bg-card p-4 shadow-2xl shadow-black/70">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Hızlı erişim
                </p>
                <Link
                  href="/library"
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-white/[0.06]"
                >
                  <LayoutGrid className="size-4 text-accent" />
                  Kütüphanem
                </Link>
                <Link
                  href="/library#indirmeler"
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-white/[0.06]"
                >
                  <Download className="size-4 text-accent" />
                  İndirmeler
                </Link>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Sahip olduğun oyunlar
                </p>
                {games.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Giriş yap ve satın aldığın oyunlar burada listelenir.
                  </p>
                ) : (
                  <ul className="mt-2 flex max-h-[200px] flex-col gap-2 overflow-y-auto pr-1">
                    {games.map((g) => (
                      <li key={g.id}>
                        <Link
                          href={`/games/${g.slug}`}
                          className="group flex items-center gap-2 rounded-md p-1 hover:bg-white/[0.06]"
                        >
                          <div className="relative size-10 shrink-0 overflow-hidden rounded border border-white/10">
                            <Image
                              src={g.coverImageUrl ?? fallbackCoverWithWidth(200)}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <span className="line-clamp-2 text-xs text-foreground group-hover:text-accent">
                            {g.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function NavFriendsItem({ active }: { active: boolean }) {
  const { open, onEnter, onLeave } = useHoverOpen();
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!open) return;
    let ok = true;
    fetch("/api/nav/friends-preview")
      .then((r) => r.json())
      .then((d: { onlineCount?: number; signedIn?: boolean }) => {
        if (!ok) return;
        setOnlineCount(typeof d.onlineCount === "number" ? d.onlineCount : 0);
        setSignedIn(Boolean(d.signedIn));
      })
      .catch(() => {
        if (!ok) return;
        setOnlineCount(0);
        setSignedIn(false);
      });
    return () => {
      ok = false;
    };
  }, [open]);

  const statusLine = !signedIn
    ? "Çevrim içi sayısı için giriş yap."
    : onlineCount === null
      ? "…"
      : `${onlineCount} arkadaşın çevrim içi`;

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Link
        href="/friends"
        className={cn(
          linkBase,
          active
            ? "bg-white/[0.07] text-foreground shadow-[inset_0_-2px_0_0_hsl(var(--accent))]"
            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
        )}
      >
        Arkadaşlar
      </Link>
      {open ? (
        <div className="absolute left-0 top-full z-[70] w-[min(calc(100vw-2rem),380px)] pt-1.5">
          <div className="rounded-xl border border-white/[0.1] bg-card p-4 shadow-2xl shadow-black/70">
            <p className="mb-3 text-sm font-medium leading-snug text-foreground">
              {statusLine}
            </p>
            <div className="flex flex-col gap-0.5 border-t border-white/[0.06] pt-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hızlı erişim
              </p>
              <Link
                href="/friends"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-white/[0.06]"
              >
                <Users className="size-4 text-accent" />
                Arkadaş listesi
              </Link>
              <Link
                href="/friends"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-white/[0.06]"
              >
                <MessageCircle className="size-4 text-accent" />
                Mesajlar
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function NavCommunityItem({ active }: { active: boolean }) {
  const { open, onEnter, onLeave } = useHoverOpen();

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Link
        href="/community"
        className={cn(
          linkBase,
          active
            ? "bg-white/[0.07] text-foreground shadow-[inset_0_-2px_0_0_hsl(var(--accent))]"
            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
        )}
      >
        Topluluk
      </Link>
      {open ? (
        <div className="absolute left-0 top-full z-[70] min-w-[220px] pt-1.5">
          <div className="rounded-xl border border-white/[0.1] bg-card p-3 shadow-2xl shadow-black/70">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Topluluk
            </p>
            <div className="flex flex-col gap-0.5">
              <Link
                href="/community/market"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-white/[0.06]"
              >
                <Store className="size-4 text-accent" />
                Topluluk pazarı
              </Link>
              <Link
                href="/community#gruplar"
                className="rounded-md px-2 py-2 text-sm hover:bg-white/[0.06]"
              >
                Gruplar
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
