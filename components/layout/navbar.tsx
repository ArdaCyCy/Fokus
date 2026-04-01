"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavCommunityItem,
  NavFriendsItem,
  NavLibraryItem,
} from "@/components/layout/nav-hover-menus";
import { NavAuthSection } from "@/components/layout/nav-user-hud";

/** Mobil menü sırası: Mağaza → Haberler → Kütüphane → Arkadaşlar → Topluluk → Profil */
const primaryNavLinks = [
  { href: "/", label: "Mağaza" },
  { href: "/news", label: "Haberler" },
  { href: "/library", label: "Kütüphane" },
  { href: "/friends", label: "Arkadaşlar" },
  { href: "/community", label: "Topluluk" },
  { href: "/profile", label: "Profil" },
  { href: "/dashboard", label: "Geliştirici paneli" },
] as const;

const navLinkClass = (active: boolean) =>
  cn(
    "relative shrink-0 rounded px-2.5 py-2 text-[11px] font-medium uppercase tracking-wide transition-colors duration-200 sm:text-[12px] xl:px-3 xl:text-[13px]",
    active
      ? "bg-white/[0.07] text-foreground shadow-[inset_0_-2px_0_0_hsl(var(--accent))]"
      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
  );

function navItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  return (
    <header className="nav-bar sticky top-0 z-40 w-full">
      <div className="container-shell flex h-[52px] items-center justify-between gap-2 md:h-14 md:gap-4">
        <div className="flex min-w-0 items-center gap-3 md:gap-5">
          <span
            className={cn(
              "shrink-0 cursor-default select-none font-heading text-lg font-bold tracking-tight text-accent md:text-xl",
              (pathname === "/" || pathname.startsWith("/games")) &&
                "drop-shadow-[0_0_12px_hsl(var(--accent)/0.45)]"
            )}
            aria-label="Fokus"
          >
            Fokus
          </span>
          <nav
            className="hidden min-w-0 items-center gap-0.5 md:flex"
            aria-label="Ana"
          >
            <Link
              href="/"
              className={navLinkClass(navItemActive(pathname, "/"))}
            >
              Mağaza
            </Link>
            <Link
              href="/news"
              className={navLinkClass(navItemActive(pathname, "/news"))}
            >
              Haberler
            </Link>
            <NavLibraryItem active={navItemActive(pathname, "/library")} />
            <NavFriendsItem active={navItemActive(pathname, "/friends")} />
            <NavCommunityItem active={navItemActive(pathname, "/community")} />
            <Link
              href="/profile"
              className={navLinkClass(navItemActive(pathname, "/profile"))}
            >
              Profil
            </Link>
            <Link
              href="/dashboard"
              className={navLinkClass(navItemActive(pathname, "/dashboard"))}
            >
              Geliştirici
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
          <Button variant="ghost" size="icon" className="md:hidden" asChild>
            <Link href="/search" aria-label="Ara">
              <Search className="size-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            asChild
          >
            <Link href="/search" aria-label="Ara">
              <Search className="size-5" />
            </Link>
          </Button>
          <div className="hidden md:flex md:items-center md:gap-0.5">
            <NavAuthSection />
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Menüyü aç"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4">
              <SheetHeader>
                <SheetTitle className="text-left text-accent">Menü</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1" aria-label="Mobil">
                {primaryNavLinks.map(({ href, label }) => {
                  const active = navItemActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-lg px-3 py-3 text-base font-medium",
                        active
                          ? "bg-white/[0.07] text-accent"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
                <Link
                  href="/library#indirmeler"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 pl-6 text-sm text-muted-foreground hover:bg-muted"
                >
                  → İndirmeler
                </Link>
                <Link
                  href="/community/market"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 pl-6 text-sm text-muted-foreground hover:bg-muted"
                >
                  → Topluluk pazarı
                </Link>
              </nav>
              <div className="mt-auto border-t border-border pt-4">
                <NavAuthSection />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
