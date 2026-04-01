"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Bell,
  Heart,
  LogOut,
  Newspaper,
  Settings,
  ShoppingCart,
  User,
  Wallet,
  LayoutDashboard,
  LifeBuoy,
} from "lucide-react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  useClerk,
  useUser,
} from "@clerk/nextjs";

import { formatTryFromCents } from "@/lib/format/currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClerkUiEnabled } from "@/components/auth/auth-mode-provider";

function IconNavLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors",
        "hover:border-border hover:bg-muted hover:text-foreground"
      )}
      aria-label={label}
      title={label}
    >
      {children}
    </Link>
  );
}

function WishlistNavIcon() {
  return (
    <IconNavLink href="/wishlist" label="İstek listesi">
      <Heart className="size-5" strokeWidth={2} />
    </IconNavLink>
  );
}

function CartNavIcon() {
  return (
    <IconNavLink href="/cart" label="Sepet">
      <ShoppingCart className="size-5" />
    </IconNavLink>
  );
}

type MeUser = {
  id: string;
  username: string | null;
  email: string | null;
  imageUrl?: string | null;
  walletBalanceCents: number;
  unreadNotificationCount: number;
};

type NotifItem = {
  id: string;
  title: string;
  readAt: string | null;
  createdAt: string;
  type: string;
};

function usePresencePing() {
  useEffect(() => {
    const ping = () => {
      void fetch("/api/auth/presence", { method: "POST" }).catch(() => {});
    };
    ping();
    const id = setInterval(ping, 90_000);
    return () => clearInterval(id);
  }, []);
}

function NotificationsMenu({
  items,
  unread,
  onRefresh,
}: {
  items: NotifItem[];
  unread: number;
  onRefresh: () => void;
}) {
  return (
    <DropdownMenu onOpenChange={(o) => o && onRefresh()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Bildirimler"
        >
          <Bell className="size-5" />
          {unread > 0 ? (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Bildirimler</span>
          {unread > 0 ? (
            <button
              type="button"
              className="text-xs font-normal text-accent hover:underline"
              onClick={async () => {
                await fetch("/api/notifications", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ markAll: true }),
                });
                onRefresh();
              }}
            >
              Tümünü okundu işaretle
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              Bildirim yok.
            </p>
          ) : (
            items.slice(0, 25).map((n) => (
              <div
                key={n.id}
                className={cn(
                  "border-b border-border/50 px-2 py-2 text-xs last:border-0",
                  !n.readAt && "bg-accent/5"
                )}
              >
                <p className="font-medium text-foreground">{n.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="w-full cursor-pointer">
            Tüm bildirimler
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountMenuClerk({
  me,
  avatarUrl,
  initials,
  onRefresh,
}: {
  me: MeUser;
  avatarUrl?: string | null;
  initials: string;
  onRefresh: () => void;
}) {
  const { signOut, openUserProfile } = useClerk();

  return (
    <DropdownMenu onOpenChange={(o) => o && onRefresh()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 rounded-full border border-border px-1.5 pr-3 hover:bg-muted"
          aria-label="Hesap menüsü"
        >
          <Avatar className="size-8 border-0">
            <AvatarImage src={avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-muted text-[10px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[5.5rem] truncate text-xs font-semibold text-success sm:inline">
            {formatTryFromCents(me.walletBalanceCents)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-xs text-muted-foreground">Bakiye</p>
          <p className="text-base font-semibold text-success">
            {formatTryFromCents(me.walletBalanceCents)}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/wallet" className="flex items-center gap-2">
            <Wallet className="size-4" />
            Cüzdanımı görüntüle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            openUserProfile();
          }}
        >
          <User className="size-4" />
          Hesabı yönet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="size-4" />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="size-4" />
            Ayarlar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/support" className="flex items-center gap-2">
            <LifeBuoy className="size-4" />
            Destek
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/news" className="flex items-center gap-2">
            <Newspaper className="size-4" />
            Haberler
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="size-4" />
            Geliştirici paneli
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            void signOut({ redirectUrl: "/" });
          }}
        >
          <LogOut className="size-4" />
          Hesaptan çık
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountMenuDemo({
  me,
  avatarUrl,
  initials,
  onRefresh,
}: {
  me: MeUser;
  avatarUrl?: string | null;
  initials: string;
  onRefresh: () => void;
}) {
  return (
    <DropdownMenu onOpenChange={(o) => o && onRefresh()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 rounded-full border border-border px-1.5 pr-3 hover:bg-muted"
          aria-label="Hesap menüsü"
        >
          <Avatar className="size-8 border-0">
            <AvatarImage src={avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-muted text-[10px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[5.5rem] truncate text-xs font-semibold text-success sm:inline">
            {formatTryFromCents(me.walletBalanceCents)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-xs text-muted-foreground">Bakiye</p>
          <p className="text-base font-semibold text-success">
            {formatTryFromCents(me.walletBalanceCents)}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/wallet" className="flex items-center gap-2">
            <Wallet className="size-4" />
            Cüzdanımı görüntüle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="size-4" />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="size-4" />
            Ayarlar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/support" className="flex items-center gap-2">
            <LifeBuoy className="size-4" />
            Destek
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            void fetch("/api/auth/sign-out", { method: "POST" }).then(() =>
              window.location.reload()
            );
          }}
        >
          <LogOut className="size-4" />
          Hesaptan çık
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HudInnerClerk() {
  const { user, isLoaded } = useUser();
  const [me, setMe] = useState<MeUser | null>(null);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [rMe, rN] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/notifications", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (rMe?.user) setMe(rMe.user as MeUser);
      setNotifs(rN.items ?? []);
    } catch {
      /* ignore */
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  usePresencePing();

  if (!isLoaded || !ready) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="size-9 shrink-0 animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>
    );
  }
  if (!me) return null;

  const initials =
    user?.username?.slice(0, 2).toUpperCase() ??
    user?.firstName?.slice(0, 1).toUpperCase() ??
    me.username?.slice(0, 2).toUpperCase() ??
    me.email?.slice(0, 1).toUpperCase() ??
    "?";

  const avatarUrl = user?.imageUrl ?? me.imageUrl ?? null;
  const unread = me.unreadNotificationCount ?? 0;

  return (
    <div className="flex items-center gap-0.5">
      <NotificationsMenu
        items={notifs}
        unread={unread}
        onRefresh={() => void refresh()}
      />
      <WishlistNavIcon />
      <CartNavIcon />
      <AccountMenuClerk
        me={me}
        avatarUrl={avatarUrl}
        initials={initials}
        onRefresh={() => void refresh()}
      />
    </div>
  );
}

function HudInnerDemo() {
  const [me, setMe] = useState<MeUser | null>(null);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [rMe, rN] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/notifications", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (rMe?.user) setMe(rMe.user as MeUser);
      else setMe(null);
      setNotifs(rN.items ?? []);
    } catch {
      setMe(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  usePresencePing();

  if (!ready) return null;
  if (!me) return null;

  const initials =
    me.username?.slice(0, 2).toUpperCase() ??
    me.email?.slice(0, 1).toUpperCase() ??
    "?";

  return (
    <div className="flex items-center gap-0.5">
      <NotificationsMenu
        items={notifs}
        unread={me.unreadNotificationCount}
        onRefresh={() => void refresh()}
      />
      <WishlistNavIcon />
      <CartNavIcon />
      <AccountMenuDemo
        me={me}
        avatarUrl={me.imageUrl}
        initials={initials}
        onRefresh={() => void refresh()}
      />
    </div>
  );
}

export function NavAuthSection() {
  const clerkUi = useClerkUiEnabled();
  if (clerkUi) {
    return (
      <>
        <SignedOut>
          <div className="flex items-center gap-0.5">
            <CartNavIcon />
            <SignInButton
              mode="modal"
              fallbackRedirectUrl="/"
              forceRedirectUrl="/"
            >
              <Button variant="default" size="sm">
                Giriş
              </Button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <HudInnerClerk />
        </SignedIn>
      </>
    );
  }

  return <HudDemoGate />;
}

function HudDemoGate() {
  const [hasUser, setHasUser] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setHasUser(Boolean(d?.user)))
      .catch(() => setHasUser(false));
  }, []);

  if (hasUser === null) return null;
  if (hasUser) return <HudInnerDemo />;
  return (
    <div className="flex items-center gap-0.5">
      <CartNavIcon />
      <Button variant="outline" size="sm" asChild>
        <Link href="/sign-in">Giriş</Link>
      </Button>
    </div>
  );
}
