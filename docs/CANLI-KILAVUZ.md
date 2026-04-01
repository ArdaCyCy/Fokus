# Fokus — canlı site (Vercel) kontrol listesi

Bu liste [fokus-omega.vercel.app](https://fokus-omega.vercel.app) gibi bir ortamı **çalışır, güvenli ve tutarlı** tutmak içindir. “Steam ile birebir” teknik olarak mümkün değil; hedef **güvenilir bir dijital mağaza** olmalıdır.

## Senin yapman gerekenler (özet)

### 1. Kodun güncel olduğundan emin ol
- Bilgisayarındaki değişiklikleri **commit + `git push origin main`** ile GitHub’a gönder.
- Vercel projesi bu repoya bağlıysa **otomatik yeni deployment** oluşur; bitince site güncellenir.
- Eski sürümde “Filtrele ve listele” ikinci kez görünür; yeni sürümde tek vitrin (Fokus Mağazası + arama) vardır.

### 2. Vercel — ortam değişkenleri (Production)
`.env.local` sunucuya gitmez. Vercel → Project → **Settings → Environment Variables** içinde en azından:

| Değişken | Ne işe yarar |
|----------|----------------|
| `DATABASE_URL` | PostgreSQL (Neon vb.) — **zorunlu** |
| `NEXT_PUBLIC_APP_URL` | Tam adres: `https://fokus-omega.vercel.app` veya kendi alan adın |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | Giriş (ikisi birden) |
| `CLERK_WEBHOOK_SECRET` | İsteğe bağlı; yeni kullanıcı → hoş geldin e-postası için |
| `BLOB_READ_WRITE_TOKEN` | İsteğe bağlı; yoksa profil görseli yerelde `public/uploads` mantığı production’da çalışmayabilir |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | İsteğe bağlı; API rate limit |
| `RESEND_API_KEY` + `RESEND_FROM` | İsteğe bağlı; e-postalar |
| İyzico anahtarları + `IYZICO_URI` | Kart ödemesi açılacaksa |

Şema: Production’da ilk kez `npx prisma db push` veya migrate’i **kendi makinen veya CI’dan** canlı DB’ye uygula.

### 3. Veritabanı
- Boş mağaza normaldir: **Admin onayından geçmiş yayımlı oyun** yoksa liste 0 görünür.
- `prisma/seed.ts` ile kategoriler; geliştirici panelinden gerçek oyun ekleyip **yönetici onayı** ver.

### 4. Clerk
- Clerk Dashboard → **Domains / redirect URL**: canlı kök + `/sign-in`, `/sign-up`, `/sso-callback`.

Canlıda **HTTPS** olmalı (`NEXT_PUBLIC_APP_URL` da `https://...`).

### 5. Güvenlik ve güven
- Canlıda `DEMO_MODE=true` kullanma.
- Yasal metinleri `/about/*` için gerçek metinlerle doldur (veya avukat onayı).
- İyzico **canlı** anahtarlara geçmeden gerçek kartla satış iddiası verme.

### 6. İzleme (isteğe bağlı ama üretim için iyi)
- Vercel Analytics / Log Drains
- Neon’dan DB metrikleri
- Hata izleme (Sentry vb.)

## “Steam kalitesi” beklentisi
Steam; CDN, indirme altyapısı, küresel ölçek, yıllar süren özellik seti. Fokus’un hedefi **bu ölçek değil**; hedef: stabil ödeme, güvenli oturum, doğru veri, düzgün mağaza deneyimi.
