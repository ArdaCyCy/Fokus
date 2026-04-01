import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

/** prisma.config varken Prisma CLI kendi başına .env okumaz; Next ile aynı kökte .env + .env.local yükle. */
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});

/**
 * Prisma 7 hazırlığı: seed / migration yolu package.json#prisma yerine burada.
 * Bağlantı adresi prisma/schema.prisma içindeki env("DATABASE_URL") ile tanımlı.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
});
