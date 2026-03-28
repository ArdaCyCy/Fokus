# Yedekleme ve kurtarma (Fokus)

## PostgreSQL (Neon / yönetilen Postgres)

1. **Otomatik yedekler**: Sağlayıcınızın günlük snapshot / PITR ayarlarını açın.
2. **Manuel döküm**: Haftalık `pg_dump` veya Neon export; şifreli depoda saklayın.
3. **Kurtarma tatbikatı**: Çeyrekte bir yedeği boş bir instance’a restore edip `prisma migrate deploy` / `db push` doğrulayın.

## Uygulama

- Ortam değişkenleri: `DATABASE_URL`, Clerk ve Redis anahtarları gizli kasada tutulur; `.env` repoda yoktur.

## RPO / RTO hedefi (başlangıç)

- RPO: 24 saat (yönetilen DB snapshot varsayımıyla)
- RTO: 4 saat

Üretim için bu değerler düşürülmeli ve yazılı hale getirilmelidir.
