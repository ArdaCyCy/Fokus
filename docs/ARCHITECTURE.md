# Fokus — mimari özeti

Bu depo, **tam işlevli bir dijital oyun mağazası**dır: vitrin, ödeme, kütüphane, geliştirici paneli, yönetim ve sosyal özellikler tek Next.js uygulamasında toplanmıştır.

## Backend (Node.js)

Sunucu tarafı **Next.js App Router Route Handlers** (`app/api/**/route.ts`) ile yazılmıştır; ayrı bir Express/Fastify sunucusu yoktur. Bu, **Node.js üzerinde çalışan gerçek bir HTTP API** katmanıdır (JSON, form, webhook).

Örnek uçlar:

| Alan | Örnek yollar |
|------|----------------|
| Kimlik / oturum | `/api/auth/me`, `/api/auth/sign-in`, `/api/auth/sign-out`, `/api/auth/presence` |
| Mağaza & ödeme | `/api/cart`, `/api/checkout/iyzico`, `/api/checkout/wallet`, `/api/payments/iyzico/callback`, `/api/refunds` |
| Geliştirici | `/api/developer/games`, `/api/developer/onboarding` |
| İçerik & sosyal | `/api/library`, `/api/wishlist`, `/api/reviews`, `/api/friends`, `/api/gifts`, `/api/news` |
| Yönetim | `/api/admin/games/moderate`, `/api/admin/review-reports` |
| Sağlık | `/api/health` |

Tam liste: `app/api` altındaki tüm `route.ts` dosyaları.

## Veritabanı (PostgreSQL)

**Prisma ORM** ile **PostgreSQL** (ör. Neon) kullanılır. Şema: `prisma/schema.prisma`.

Önemli modeller (özet):

- **User** — Clerk ile eşleşen uygulama kullanıcısı; rol, cüzdan, profil.
- **Game** — başlık, slug, fiyat (`priceCents`), açıklamalar, kapak, kategoriler, durum (taslak / onay / yayında). **Satıcı:** `developerSlug` alanı geliştirici `User.id` ile doldurulur (`/api/developer/games`).
- **Purchase**, **Earning**, **CartItem**, **Review**, **Wishlist**, **Gift**, … — mağaza ve gelir paylaşımı.

**MongoDB** kullanılmıyor; ilişkisel veri ve işlemler PostgreSQL üzerinde.

## Kimlik (Auth)

**Clerk** (hosted auth) + uygulama veritabanında `User` kaydı. Webhook: `app/api/webhooks/clerk/route.ts`.

**Neden Supabase Auth değil?** Projede Clerk, ödeme akışları ve mevcut kullanıcı modeli ile entegre. Supabase’e taşımak tüm oturum, webhook ve rol akışının yeniden yazılmasını gerektirir; bu repoda **önerilmez** (ayrı bir “sıfırdan” proje olarak değerlendirilebilir).

## Ön yüz (Next.js)

- **Server Components:** sayfa verisi, Prisma sorguları, SEO metadata.
- **Client Components:** formlar, etkileşimli UI (`"use client"`).
- Stil: **Tailwind CSS** (mevcut tasarım sistemi).

## Oyun detay URL’leri

- Kanonik: **`/games/[slug]`** (SEO dostu).
- Yayında oyun **veritabanı `id`** ile açılırsa (tire içermeyen uzun id), sunucu **308/307 yönlendirme** ile aynı sayfayı slug adresine taşır (`app/games/[slug]/page.tsx`).

## Portföy / CV için kısa cümle

> Full-stack marketplace: **Next.js 15 (Node) REST API**, **PostgreSQL + Prisma**, **Clerk auth**, ödeme entegrasyonu (İyzico), server/client bileşen ayrımı, TypeScript.
