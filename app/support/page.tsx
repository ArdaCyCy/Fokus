import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StorePageHero } from "@/components/store/store-page-hero";

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || null;

const faq = [
  {
    q: "Satın alım nasıl çalışır?",
    a: "Sepetten ödeme adımına geçilir. İyzico yapılandırıldıysa kartla güvenli ödeme (sandbox veya canlı); aksi halde cüzdan bakiyesi kullanılır. Tamamlanınca lisans kütüphanene eklenir.",
  },
  {
    q: "İade talebi nasıl olur?",
    a: "Kütüphanedeki satın alım kartından “İade talep et” ile başlatabilirsin: cüzdanla alındıysa bakiyeye yansıyabilir; kartla (İyzico) alındıysa destek üzerinden yönlendirilirsin. Süre ve koşullar /about/refunds sayfasındaki iade politikasına tabidir.",
  },
  {
    q: "Hesabımı nasıl korurum?",
    a: "Güçlü parola, güvenilir cihaz ve (Clerk ile) çok faktörlü doğrulama önerilir. Oturum ve güvenlik için Ayarlar → Güvenlik bölümüne bak.",
  },
  {
    q: "İstek listesi ve bildirimler nerede?",
    a: "Üst çubukta bildirim zili, hemen yanında kalp simgesi (istek listesi) ve sepet yer alır. Bildirim tercihlerini Ayarlar → Tümü altındaki formdan yönetirsin.",
  },
  {
    q: "Arkadaşlarımda çevrim dışı görünmek istiyorum",
    a: "Profilindeki durum rozetine tıklayıp “Gizli mod”u seç veya Ayarlar → Tümü → Çevrim durumu ve gizlilik bölümünden aynı seçeneği aç.",
  },
  {
    q: "Oyun indirdim ama kurulumda sorun yaşıyorum",
    a: "Önce /library üzerinden dosyayı yeniden indirmeyi dene. Windows Defender veya antivirüsün karantinaya almadığını kontrol et. Çözülmezse destek e-postası veya yardım formu (yakında) ile bize yaz.",
  },
] as const;

export default function SupportPage() {
  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-3xl px-4">
        <StorePageHero
          eyebrow="Destek"
          title="Yardım ve iletişim"
          description="SSS, ödeme ve iadeler, politikalar ve oyuncu araçlarına tek sayfadan ulaş."
        />

        <div className="space-y-4">
          {supportEmail ? (
            <Card className="border-accent/25 bg-card/95">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">İletişim</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Hesap, ödeme ve teknik konularda bize şu adresten ulaşabilirsin:{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="font-medium text-accent underline-offset-4 hover:underline"
                  >
                    {supportEmail}
                  </a>
                </p>
                <p className="mt-2 text-xs">
                  Üretimde{" "}
                  <code className="rounded bg-muted px-1 text-foreground">
                    NEXT_PUBLIC_SUPPORT_EMAIL
                  </code>{" "}
                  ile yapılandırılır.
                </p>
              </CardContent>
            </Card>
          ) : null}

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Sık sorulan sorular
            </h2>
            <div className="grid gap-3">
              {faq.map((item) => (
                <Card
                  key={item.q}
                  className="border-white/[0.07] bg-card/95"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.q}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Card className="border-white/[0.07] bg-card/95">
            <CardHeader>
              <CardTitle className="text-base">Politikalar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Gizlilik, yasal metinler ve erişilebilirlik.</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/about">Fokus hakkında</Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/about/privacy">Gizlilik politikası</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/[0.07] bg-card/95">
            <CardHeader>
              <CardTitle className="text-base">Oyuncu araçları</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <Button asChild variant="outline" size="sm">
                <Link href="/library">Kütüphane</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/wallet">Cüzdan</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/wishlist">İstek listesi</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/notifications">Bildirimler</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/settings">Ayarlar</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/friends">Arkadaşlar</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
