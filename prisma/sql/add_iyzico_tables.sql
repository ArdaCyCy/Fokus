-- Prisma db push kullanmıyorsan manuel Neon senkronu (özet).
-- Güvenli yol: proje kökünde `npx prisma db push`

ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "iyzicoPaymentId" TEXT;
CREATE INDEX IF NOT EXISTS "Purchase_iyzicoPaymentId_idx" ON "Purchase"("iyzicoPaymentId");

CREATE TABLE IF NOT EXISTS "IyzicoPaymentIntent" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "pendingCheckoutId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IyzicoPaymentIntent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IyzicoPaymentIntent_conversationId_key" ON "IyzicoPaymentIntent"("conversationId");
CREATE UNIQUE INDEX IF NOT EXISTS "IyzicoPaymentIntent_pendingCheckoutId_key" ON "IyzicoPaymentIntent"("pendingCheckoutId");

CREATE TABLE IF NOT EXISTS "IyzicoProcessedPayment" (
  "paymentId" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IyzicoProcessedPayment_pkey" PRIMARY KEY ("paymentId")
);

-- FK'ler ve User ilişkisi için tam şema prisma/schema.prisma ile uyumlu olmalıdır; tercihen `db push` kullanın.
