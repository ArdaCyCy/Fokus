import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { readDemoSessionUserId } from "@/lib/auth/demo-session";
import { isClerkEnabled } from "@/lib/auth/clerk-config";
import { roleFromClerkMetadata } from "@/lib/auth/roles";
import { db } from "@/lib/db";

export async function getOptionalAppUser() {
  if (isClerkEnabled()) {
    const { userId } = await auth();
    if (!userId) return null;
    const cu = await currentUser();
    const email = cu?.emailAddresses?.[0]?.emailAddress ?? null;
    const username = cu?.username ?? cu?.firstName ?? null;
    const imageUrl = cu?.imageUrl ?? null;
    const rolePatch = roleFromClerkMetadata(cu);
    return db.user.upsert({
      where: { clerkId: userId },
      update: { email, username, imageUrl, ...rolePatch },
      create: {
        clerkId: userId,
        email,
        username,
        imageUrl,
        role: rolePatch.role ?? "USER",
      },
    });
  }

  const demoUserId = await readDemoSessionUserId();
  if (!demoUserId) return null;
  return db.user.findUnique({ where: { id: demoUserId } });
}

export async function requireAppUser(returnUrl: string) {
  const user = await getOptionalAppUser();
  if (!user) redirect(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
  return user;
}
