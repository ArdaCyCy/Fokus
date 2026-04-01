import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

void env;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

/** Sunucusuz (Vercel) isolate başına tek client — bağlantı patlaması ve gereksiz yeniden kurulum azalır. */
export const db = globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrisma());

