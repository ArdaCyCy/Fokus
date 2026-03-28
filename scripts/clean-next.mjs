import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const nextDir = join(root, ".next");
if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("Removed .next");
}

for (const rel of [
  join("node_modules", ".cache"),
  ".turbo",
  join(".next", "cache"),
]) {
  const p = join(root, rel);
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true });
    console.log(`Removed ${rel}`);
  }
}

console.log("Clean done. Tum next dev / next start sureclerini durdur, sonra: npm run dev veya npm run build");
