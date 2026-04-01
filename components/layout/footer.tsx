import Link from "next/link";

import { LEGAL_PAGES } from "@/lib/legal/pages";

const essentials = [
  { href: "/settings", label: "Ayarlar" },
  { href: "/support", label: "Destek" },
  { href: "/help", label: "Yardım" },
  { href: "/become-developer", label: "Geliştirici ol" },
  { href: "/about", label: "Fokus hakkında" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/80 bg-card/80 backdrop-blur-sm">
      <div className="container-shell py-10 pb-28 md:pb-24">
        <nav
          className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-foreground"
          aria-label="Hızlı bağlantılar"
        >
          {essentials.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </nav>
        <nav
          className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-border/60 pt-6 text-[11px] text-muted-foreground"
          aria-label="Yasal bağlantılar"
        >
          {LEGAL_PAGES.map((p) => (
            <Link
              key={p.slug}
              href={`/about/${p.slug}`}
              className="hover:text-accent hover:underline"
            >
              {p.title}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {year} Fokus
        </p>
      </div>
    </footer>
  );
}
