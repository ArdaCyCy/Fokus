import Link from "next/link";

import { isClerkEnabled } from "@/lib/auth/clerk-config";

export default function ForgotPasswordPage() {
  const clerkOn = isClerkEnabled();

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-heading text-xl font-semibold text-foreground">
        Şifremi unuttum
      </h1>
      {clerkOn ? (
        <>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Clerk ile giriş yapıyorsan:{" "}
            <strong className="text-foreground">Giriş yap</strong> sayfasında
            e-postanı yaz ve formdaki{" "}
            <strong className="text-foreground">Şifremi unuttum</strong>{" "}
            bağlantısını kullan. E-posta doğrulaması Clerk panelindeki
            stratejilere göre açılır.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
          >
            Giriş sayfasına git →
          </Link>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Demo (Clerk kapalı) modda şifre sıfırlama yok. Yerel test için hesabı
          veritabanından veya seed ile yönet.
        </p>
      )}
    </div>
  );
}
