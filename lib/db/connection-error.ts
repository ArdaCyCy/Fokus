/** Prisma / Postgres bağlantı veya kimlik doğrulama hatalarında sayfa çökmesin. */
export function isDatabaseUnavailableError(e: unknown): boolean {
  const name = e instanceof Error ? e.name : "";
  const msg = e instanceof Error ? e.message : String(e);
  if (name === "PrismaClientInitializationError") return true;
  return (
    msg.includes("Authentication failed") ||
    msg.includes("Can't reach database server") ||
    msg.includes("P1001") ||
    msg.includes("P1000")
  );
}
