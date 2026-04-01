import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { put } from "@vercel/blob";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extForMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  const sub = mime.split("/")[1];
  return sub && sub.length <= 8 ? sub : "img";
}

/**
 * Profil avatar / kapak görseli. `BLOB_READ_WRITE_TOKEN` varsa Vercel Blob,
 * yoksa `public/uploads/profile/...` (yerel geliştirme).
 */
export async function storeProfileImage(opts: {
  userId: string;
  kind: "avatar" | "background";
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  if (!ALLOWED.has(opts.contentType)) {
    throw new Error("Desteklenen türler: JPEG, PNG, WebP, GIF.");
  }
  if (opts.buffer.length > MAX_BYTES) {
    throw new Error("Dosya en fazla 2 MB olabilir.");
  }

  const ext = extForMime(opts.contentType);
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    const pathname = `profile/${opts.userId}/${opts.kind}-${randomUUID()}.${ext}`;
    const blob = await put(pathname, opts.buffer, {
      access: "public",
      token,
      contentType: opts.contentType,
    });
    return blob.url;
  }

  const dir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "profile",
    opts.userId,
  );
  await mkdir(dir, { recursive: true });
  const name = `${opts.kind}-${randomUUID()}.${ext}`;
  const full = path.join(dir, name);
  await writeFile(full, opts.buffer);
  return `/uploads/profile/${opts.userId}/${name}`;
}
