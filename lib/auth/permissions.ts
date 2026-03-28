import { redirect } from "next/navigation";

import { requireAppUser } from "@/lib/auth/app-user";

export async function requireRole(
  role: "DEVELOPER" | "ADMIN",
  returnUrl: string
) {
  const user = await requireAppUser(returnUrl);
  if (role === "ADMIN" && user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  if (role === "DEVELOPER" && user.role !== "DEVELOPER" && user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}
