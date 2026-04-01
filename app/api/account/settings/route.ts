import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAppUser } from "@/lib/auth/app-user";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

/** HTTPS URL veya yerel yüklenen `/uploads/...` yolu. */
const profileImageRef = z
  .string()
  .max(2048)
  .refine(
    (s) =>
      s === "" ||
      s.startsWith("/uploads/") ||
      /^https?:\/\//i.test(s),
    { message: "Geçersiz görsel adresi" },
  );

const bodySchema = z.object({
  username: z.string().min(3).max(32).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(72).optional(),
  imageUrl: profileImageRef.optional(),
  profileFrame: z.string().max(64).optional(),
  profileBackground: profileImageRef.optional(),
  language: z.string().min(2).max(10).optional(),
  storePreferences: z
    .object({
      hideMature: z.boolean().optional(),
      autoPlayVideos: z.boolean().optional(),
    })
    .optional(),
  notificationSettings: z
    .object({
      emailNews: z.boolean().optional(),
      emailSales: z.boolean().optional(),
      desktop: z.boolean().optional(),
    })
    .optional(),
  appearOffline: z.boolean().optional(),
});

export async function GET() {
  const user = await requireAppUser("/settings");
  return NextResponse.json({
    username: user.username ?? "",
    email: user.email ?? "",
    imageUrl: user.imageUrl ?? "",
    profileFrame: user.profileFrame ?? "",
    profileBackground: user.profileBackground ?? "",
    language: user.language ?? "tr",
    storePreferences: user.storePreferences ?? {
      hideMature: true,
      autoPlayVideos: false,
    },
    notificationSettings: user.notificationSettings ?? {
      emailNews: true,
      emailSales: true,
      desktop: true,
    },
  });
}

export async function PATCH(req: Request) {
  const user = await requireAppUser("/settings");
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  if (data.email) {
    const exists = await db.user.findFirst({
      where: { email: data.email.toLowerCase(), id: { not: user.id } },
      select: { id: true },
    });
    if (exists) return NextResponse.json({ error: "Bu e-posta baska hesapta kullaniliyor" }, { status: 409 });
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      username: data.username,
      email: data.email?.toLowerCase(),
      imageUrl:
        data.imageUrl === undefined
          ? undefined
          : data.imageUrl === ""
            ? null
            : data.imageUrl,
      profileFrame: data.profileFrame,
      profileBackground:
        data.profileBackground === undefined
          ? undefined
          : data.profileBackground === ""
            ? null
            : data.profileBackground,
      language: data.language,
      storePreferences: data.storePreferences,
      notificationSettings: data.notificationSettings,
      appearOffline: data.appearOffline,
      passwordHash: data.password ? hashPassword(data.password) : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
