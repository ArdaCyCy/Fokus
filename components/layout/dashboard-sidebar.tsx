"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Home,
  Gamepad2,
  Upload,
  DollarSign,
  Settings,
  Newspaper,
  ClipboardList,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/games", label: "Oyunlarım", icon: Gamepad2 },
  { href: "/dashboard/upload", label: "Yeni Oyun Yükle", icon: Upload },
  { href: "/dashboard/onboarding", label: "Onboarding / KYC", icon: ClipboardList },
  { href: "/dashboard/news", label: "Haberler", icon: Newspaper },
  { href: "/dashboard/earnings", label: "Kazançlarım", icon: DollarSign },
  { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1" aria-label="Dashboard menüsü">
      {links.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-white/[0.08] text-foreground shadow-[inset_2px_0_0_0_hsl(var(--accent))]"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/80 bg-card/40 p-4 md:block">
      <p className="mb-4 font-heading text-lg font-bold text-accent">Fokus Panel</p>
      <NavLinks />
    </aside>
  );
}

export function MobileDashboardSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menüyü aç">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-r border-border">
        <SheetHeader>
          <SheetTitle className="text-accent">Fokus Panel</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <NavLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
}
