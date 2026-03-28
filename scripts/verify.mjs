#!/usr/bin/env node
import { execSync } from "node:child_process";
import process from "node:process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

try {
  run("npm run lint");
  run("npm run build");
  run("npm test");
  console.log("\n✓ verify: lint + build + test tamam.\n");
} catch {
  process.exit(1);
}
