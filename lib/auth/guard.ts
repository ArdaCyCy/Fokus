import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireAuth(returnBackUrl: string): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    const encoded = encodeURIComponent(returnBackUrl);
    redirect(`/sign-in?redirect_url=${encoded}`);
  }
  return userId;
}
