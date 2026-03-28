# Fokus

Türkiye odaklı **indie oyun mağazası** deneyimi: vitrin, arama, kütüphane, topluluk, geliştirici paneli, **Stripe** ile kart ödemesi veya **cüzdan** ile ödeme, webhook ile sipariş tamamlama, **Stripe Connect** ile geliştirici payı (isteğe bağlı), iade + transfer geri alma, **Resend** ile satın alma e-postası (isteğe bağlı), Clerk kimlik (opsiyonel), Prisma + PostgreSQL.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Prisma · Clerk · Stripe

## Hızlı başlangıç

```bash
npm install
cp .env.example .env.local
# DATABASE_URL ve diğer anahtarları doldur
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Üretim, Stripe webhook ve geliştirici paneli (Clerk `DEVELOPER` rolü) için: [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md).

Kalite: `npm run verify` (lint + build + test).

## Portföyde nasıl gösterilir?

Bu repoyu **GitHub**’da public açık tutup CV / LinkedIn’de bağlantı verebilirsin. İstersen:

- **Vercel** (veya Netlify / Railway) ile canlı demo URL’si üretip README’ye “Live demo” ekle.
- **LinkedIn** → *Featured* veya *Projects*: kısa açıklama + repo veya demo linki.
- Kişisel sitede “Seçili işler” bölümünde ekran görüntüsü + teknik özet.
- Tasarım vurgusu istiyorsan **Behance / Dribbble**’da kasıtlı bir case study (akışlar, roller, zorluklar).

Canlı demo verirken **gerçek ödeme anahtarlarını** ve **ürün veritabanını** koruduğundan emin ol; ayrı bir demo branch veya staging ortamı kullanman önerilir.

## Lisans

Özel proje — portföy ve eğitim için kullanımı özne ile netleştir.
