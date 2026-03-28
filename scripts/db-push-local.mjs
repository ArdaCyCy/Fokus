/**
 * Prisma sadece .env dosyasını okur; .env.local içindeki DATABASE_URL ile db push çalıştırır.
 * Kullanım: node scripts/db-push-local.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envLocal = resolve(root, ".env.local");
if (!existsSync(envLocal)) {
  console.error("Missing .env.local");
  process.exit(1);
}
const text = readFileSync(envLocal, "utf8");
const line = text.split("\n").find((l) => l.trim().startsWith("DATABASE_URL="));
if (!line) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}
const val = line.split("=", 2)[1]?.trim().replace(/^["']|["']$/g, "") ?? "";
if (!val) {
  console.error("Empty DATABASE_URL");
  process.exit(1);
}
process.env.DATABASE_URL = val;
const extra = process.argv.slice(2);
const r = spawnSync(
  "npx",
  ["prisma", "db", "push", ...extra],
  { cwd: root, stdio: "inherit", shell: true },
);
process.exit(r.status ?? 1);
