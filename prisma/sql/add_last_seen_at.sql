-- Neon / PostgreSQL: şema kodda var ama DB eskiyse bu dosyayı çalıştır.
-- prisma db execute --file prisma/sql/add_last_seen_at.sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3);
