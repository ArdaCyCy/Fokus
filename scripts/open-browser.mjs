/**
 * Önce 3000, sonra 3001 üzerinde çalışan Next.js örneğini bulur ve tarayıcıda açar.
 * (3000 meşgulken `next dev` 3001'e geçince `open` yanlış porta gidip 500 görebilirdi.)
 */
import http from "node:http";
import { exec } from "node:child_process";

function probeOk(port) {
  return new Promise((resolve) => {
    const req = http.get(
      `http://127.0.0.1:${port}/api/health`,
      { timeout: 2500 },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      },
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

const ports = [3000, 3001, 3002];
let chosen = 3000;
for (const p of ports) {
  if (await probeOk(p)) {
    chosen = p;
    break;
  }
}

const url = `http://localhost:${chosen}`;
if (process.platform === "win32") {
  exec(`start "" "${url}"`);
} else if (process.platform === "darwin") {
  exec(`open "${url}"`);
} else {
  exec(`xdg-open "${url}"`);
}
