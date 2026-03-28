import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import { getOptionalAppUser } from "@/lib/auth/app-user";
import { canAccessDashboard } from "@/lib/auth/roles";
import { isClerkEnabled } from "@/lib/auth/clerk-config";
import { DashboardSignOut } from "@/components/dashboard/dashboard-sign-out";
import { DashboardSidebar, MobileDashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const clerkOn = isClerkEnabled();
  const user = await getOptionalAppUser();

  if (!user) {
    redirect("/sign-in?redirect_url=%2Fdashboard");
  }

  if (!canAccessDashboard(user.role)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Erişim izni yok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Geliştirici paneli yalnızca geliştirici veya admin hesaplarına açıktır.
            </p>
            <p>
              Mevcut rol:{" "}
              <span className="font-medium text-foreground">{user.role}</span>
            </p>
            {clerkOn ? (
              <p>
                Clerk üzerinde hesabına{" "}
                <code className="rounded bg-muted px-1 text-xs">
                  publicMetadata.role
                </code>{" "}
                alanından{" "}
                <span className="font-medium text-foreground">DEVELOPER</span>{" "}
                atanmalı (veya veritabanında rolün güncellenmeli). Bir sonraki
                sayfa yüklemesinde senkronize olur.
              </p>
            ) : null}
            <Link href="/" className="text-accent hover:underline">
              Ana sayfaya dön
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userName = user.username ?? user.email ?? "Oyuncu";

  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <DashboardSidebar />
      <div className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col">
        <header className="sticky top-16 z-20 flex h-14 items-center justify-between border-b border-white/[0.06] bg-card/95 px-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <MobileDashboardSidebar />
            <p className="text-sm text-muted-foreground">
              Hoş geldin,{" "}
              <span className="font-medium text-foreground">{userName}</span>
            </p>
          </div>
          {clerkOn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <DashboardSignOut />
          )}
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
