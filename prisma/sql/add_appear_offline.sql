-- Neon / manuel: User.appearOffline (Prisma şeması ile uyumlu)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "appearOffline" BOOLEAN NOT NULL DEFAULT false;
