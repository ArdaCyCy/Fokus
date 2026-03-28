import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[50vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="max-w-md space-y-3">
        <p className="font-heading text-6xl font-bold text-muted-foreground/40">404</p>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Sayfa bulunamadı
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Aradığın adres taşınmış veya silinmiş olabilir.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/">Ana sayfaya dön</Link>
      </Button>
    </div>
  );
}
