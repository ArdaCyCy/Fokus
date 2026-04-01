import { Webhook } from "svix";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";

type ClerkUserCreated = {
  id: string;
  email_addresses?: Array<{ email_address?: string }>;
  username?: string | null;
  first_name?: string | null;
  image_url?: string | null;
};

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret tanimli degil." }, { status: 503 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Eksik webhook header." }, { status: 400 });
  }

  const payload = await req.text();
  let evt: { type?: string; data?: unknown };
  try {
    evt = new Webhook(secret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type?: string; data?: unknown };
  } catch {
    return NextResponse.json({ error: "Webhook imzasi gecersiz." }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const data = (evt.data ?? {}) as ClerkUserCreated;
    const email = data.email_addresses?.[0]?.email_address?.trim().toLowerCase() ?? null;
    const username = data.username ?? data.first_name ?? null;
    const imageUrl = data.image_url ?? null;
    if (data.id) {
      const user = await db.user.upsert({
        where: { clerkId: data.id },
        update: { email, username, imageUrl },
        create: {
          clerkId: data.id,
          email,
          username,
          imageUrl,
          role: "USER",
        },
      });
      if (user.email) {
        void sendWelcomeEmail({
          email: user.email,
          username: user.username,
          requestId: svixId,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

