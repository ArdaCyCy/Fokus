import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAppUser } from "@/lib/auth/app-user";
import { AccountSettingsForm } from "@/components/settings/account-settings-form";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { StorePageHero } from "@/components/store/store-page-hero";
import { Button } from "@/components/ui/button";

const blocks = [
  {
    title: "Aile ve içerik",
    body: "Yaş doğrulama, harcama limitleri ve mağaza içerik filtresi tek yerde toplanacak. Şimdilik mağaza tercihlerinden olgun içeriği gizleyebilirsin.",
  },
  {
    title: "Veri ve hesap",
    body: "İndirme geçmişi, satın alımlar ve GDPR kapsamında veri talepleri için destek üzerinden bize yaz; dışa aktarma akışı ürün olgunlaştıkça eklenecek.",
  },
] as const;

export default async function SettingsPage() {
  const user = await requireAppUser("/settings");
  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <StorePageHero
          eyebrow="Hesap"
          title="Ayarlar"
          description="Profil, güvenlik, mağaza ve bildirim tercihleri — tek yerden yönet."
        />

        <Tabs defaultValue="all" className="mt-2">
          <TabsList className="h-auto flex-wrap gap-1 border border-white/[0.06] bg-card/90 p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Tümü
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Güvenlik
            </TabsTrigger>
            <TabsTrigger
              value="storepref"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Mağaza
            </TabsTrigger>
            <TabsTrigger
              value="help"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Destek
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Card className="border-white/[0.07] bg-card/95 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Hesap bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                  <AccountSettingsForm
                    initial={{
                      username: user.username ?? "",
                      email: user.email ?? "",
                      imageUrl: user.imageUrl ?? "",
                      profileFrame: user.profileFrame ?? "",
                      profileBackground: user.profileBackground ?? "",
                    }}
                  />
                </CardContent>
              </Card>
              <Card className="border-white/[0.07] bg-card/95 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">
                    Mağaza, dil ve bildirimler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PreferencesForm
                    initial={{
                      language: user.language ?? "tr",
                      appearOffline: user.appearOffline ?? false,
                      storePreferences:
                        (user.storePreferences as {
                          hideMature?: boolean;
                          autoPlayVideos?: boolean;
                        } | null) ?? {
                          hideMature: true,
                          autoPlayVideos: false,
                        },
                      notificationSettings:
                        (user.notificationSettings as {
                          emailNews?: boolean;
                          emailSales?: boolean;
                          desktop?: boolean;
                        } | null) ?? {
                          emailNews: true,
                          emailSales: true,
                          desktop: true,
                        },
                    }}
                  />
                </CardContent>
              </Card>
              {blocks.map((b) => (
                <Card
                  key={b.title}
                  className="border-white/[0.07] bg-card/95"
                >
                  <CardHeader>
                    <CardTitle className="text-base">{b.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">
                    {b.body}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-5">
            <Card className="border-white/[0.07] bg-card/95">
              <CardHeader>
                <CardTitle>Güvenlik ve oturum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <ul className="list-inside list-disc space-y-2 text-foreground/90">
                  <li>
                    Güçlü ve benzersiz parola; mümkünse iki aşamalı doğrulama
                    (Clerk ile oturum açıyorsan Clerk hesap ekranından).
                  </li>
                  <li>
                    Ortak cihazlarda “Beni hatırla”yı dikkatli kullan; çıkış yapmayı
                    unutma.
                  </li>
                  <li>
                    Şüpheli aktivitede önce parolayı sıfırla, ardından{" "}
                    <Link href="/support" className="text-accent underline-offset-4 hover:underline">
                      destek
                    </Link>
                    ile iletişime geç.
                  </li>
                </ul>
                <p>
                  Clerk ile girişte oturum ve cihaz yönetimi büyük ölçüde Clerk
                  kullanıcı profilinde; harici kimlik sistemi kullanılmıyorsa parola bu sayfadaki hesap
                  formundan veya{" "}
                  <code className="rounded bg-muted px-1 text-foreground">
                    PATCH /api/account/settings
                  </code>{" "}
                  ile güncellenir.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/support">Güvenlik ve hesap yardımı</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/about/privacy">Gizlilik politikası</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storepref" className="mt-6">
            <Card className="border-white/[0.07] bg-card/95">
              <CardHeader>
                <CardTitle>Mağaza tercihleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Dil, olgun içerik, video oynatma ve bildirimler{" "}
                  <strong className="text-foreground">Tümü</strong> sekmesindeki
                  formla kaydedilir.
                </p>
                <p>
                  Keşfet sayfası ve arama sonuçları bu tercihlere göre
                  uyarlanacak şekilde genişletilecek; bölge mağazası ve öneri
                  ağırlıkları yol haritasında.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Mağazaya git</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="mt-6">
            <Card className="border-white/[0.07] bg-card/95">
              <CardHeader>
                <CardTitle>Destek ve politikalar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Ödeme, iade, kütüphane ve teknik sorunlar için yardım merkezine
                  göz at veya destek sayfasındaki SSS’yi kullan.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href="/support">Yardım ve iletişim</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/about/refunds">İade politikası</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/about/legal">Yasal</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/about/accessibility">Erişilebilirlik</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
