import Link from "next/link";
import { redirect } from "next/navigation";

import { getOptionalAppUser } from "@/lib/auth/app-user";

const links = [
  { href: "/admin", label: "Özet" },
  { href: "/admin/games", label: "Oyun onayı" },
  { href: "/admin/users", label: "Kullanıcılar" },
  { href: "/admin/payouts", label: "Ödeme talepleri" },
  { href: "/admin/review-reports", label: "İnceleme raporları" },
] as const;

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getOptionalAppUser();
  if (!user) {
    redirect("/sign-in?redirect_url=%2Fadmin");
  }
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen border-t border-white/[0.06] bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:py-10">
        <nav
          className="flex shrink-0 flex-wrap gap-2 md:w-48 md:flex-col"
          aria-label="Admin"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-white/[0.08] bg-card/80 px-3 py-2 text-sm font-medium text-foreground hover:border-accent/40"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
