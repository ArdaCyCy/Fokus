# Fokus

Türkiye odaklı **indie oyun mağazası** deneyimi: vitrin, arama, kütüphane, topluluk, geliştirici paneli, **İyzico** ile kart ödemesi veya **cüzdan** ile ödeme, ödeme dönüşü ile sipariş tamamlama, iade akışı, **Resend** ile satın alma e-postası (isteğe bağlı), Clerk kimlik (opsiyonel), Prisma + PostgreSQL.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · **PostgreSQL** · **Prisma** · **Clerk** · **Node.js API (Route Handlers)** · İyzico · Resend (isteğe bağlı)

### Backend ve veritabanı (CV / mülakat için)

- **Backend:** `app/api/**/route.ts` altında **onlarca HTTP endpoint** (REST benzeri JSON API). Ayrı Python/Express sunucusu yok; çalışma zamanı **Node.js (Next.js server)**.
- **Veritabanı:** **PostgreSQL** + **Prisma** (`prisma/schema.prisma`). `Game`, `User`, `Purchase`, `Review`, `Gift` vb. ilişkisel model.
- **Kimlik:** **Clerk** (kayıt / giriş / oturum). *(Başka bir projede Supabase Auth tercih edilebilir; bu repoda Clerk ile tam entegre akış vardır.)*
- **Detaylı mimari:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Canlı / Vercel kontrol listesi:** [docs/CANLI-KILAVUZ.md](./docs/CANLI-KILAVUZ.md)

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

**Vercel:** Projeyi bağla; ortam değişkenlerini `.env.example` ile aynı isimlerle Production’a ekle (`DATABASE_URL`, Clerk anahtarları, `NEXT_PUBLIC_APP_URL` = canlı `https://…`, İyzico anahtarları vb.). `postinstall` içinde `prisma generate` çalışır. Şema ilk kez canlı DB’ye `npx prisma db push` (veya migrate) ile uygulanmalıdır.

**Clerk:** Canlı URL’yi Clerk Dashboard → Domains / redirect URL listesine ekle; Production anahtarlarını Vercel’e koy.

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
