import Link from "next/link";

import { isClerkEnabled } from "@/lib/auth/clerk-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BecomeDeveloperPage() {
  const clerkOn = isClerkEnabled();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div>
        <h1 className="font-heading text-2xl font-bold">Geliştirici ol</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fokus’ta oyun yayınlamak için hesabında{" "}
          <strong className="text-foreground">DEVELOPER</strong> rolü olmalı.
          Yeni oyunlar <strong>admin onayı</strong> sonrası mağazada yayınlanır.
        </p>
      </div>
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Nasıl başlarım?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {clerkOn ? (
            <ol className="list-inside list-decimal space-y-2">
              <li>
                Önce{" "}
                <Link href="/sign-up" className="text-accent hover:underline">
                  kayıt ol
                </Link>{" "}
                veya{" "}
                <Link href="/sign-in" className="text-accent hover:underline">
                  giriş yap
                </Link>
                .
              </li>
              <li>
                Clerk Dashboard’da kullanıcıya{" "}
                <code className="rounded bg-muted px-1 text-xs">
                  publicMetadata.role
                </code>{" "}
                = <code className="text-foreground">DEVELOPER</code> atanır
                (kendi hesabın için test ediyorsan kendine ata).
              </li>
              <li>
                Ardından{" "}
                <Link href="/dashboard" className="text-accent hover:underline">
                  geliştirici paneline
                </Link>{" "}
                gir; oyununu yükle ve onaya gönder.
              </li>
            </ol>
          ) : (
            <p>
              Demo modda geliştirici rolü veritabanı / seed ile atanır. Clerk
              açıkken yukarıdaki akış geçerlidir.
            </p>
          )}
        </CardContent>
      </Card>
      <Link href="/" className="text-sm text-accent hover:underline">
        ← Ana sayfa
      </Link>
    </div>
  );
}
