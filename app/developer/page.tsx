import { redirect } from "next/navigation";

/** Eski / yanlış URL beklentisi → asıl panel. */
export default function DeveloperAliasPage() {
  redirect("/dashboard");
}
