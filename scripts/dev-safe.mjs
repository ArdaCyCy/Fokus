import { spawn } from "node:child_process";
import net from "node:net";
import { resolve } from "node:path";

function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    const onClose = () => resolve(false);
    socket.once("timeout", onClose);
    socket.once("error", onClose);
    socket.connect(port, host);
  });
}

const defaultPort = Number(process.env.PORT || 3000);
const inUse = await isPortOpen(defaultPort);

if (inUse) {
  console.error(
    `[dev-safe] Port ${defaultPort} zaten dolu. Ikinci bir next dev acmiyorum.`,
  );
  console.error(
    "[dev-safe] Mevcut serveri kullan veya once eski sureci kapatip tekrar deneyin.",
  );
  process.exit(1);
}

const nextCli = resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextCli, "dev"], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

