import { redirect } from "next/navigation";

/** Türkçe slug beklentisi → geliştirici paneli. */
export default function GelistiriciAliasPage() {
  redirect("/dashboard");
}
