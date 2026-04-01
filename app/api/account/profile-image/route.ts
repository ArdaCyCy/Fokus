import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/app-user";
import { storeProfileImage } from "@/lib/storage/profile-upload";

export async function POST(req: Request) {
  const user = await requireAppUser("/settings");
  const form = await req.formData();
  const kindRaw = form.get("kind");
  const file = form.get("file");

  const kind =
    kindRaw === "avatar" || kindRaw === "background" ? kindRaw : null;
  if (!kind) {
    return NextResponse.json({ error: "Geçersiz tür." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const url = await storeProfileImage({
      userId: user.id,
      kind,
      buffer: buf,
      contentType: file.type || "application/octet-stream",
    });
    return NextResponse.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Yükleme başarısız.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
