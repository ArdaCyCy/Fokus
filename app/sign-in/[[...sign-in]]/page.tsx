import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { DemoSignInForm } from "@/components/auth/demo-signin-form";
import { isClerkEnabled } from "@/lib/auth/clerk-config";
import { safeAuthRedirectUrl } from "@/lib/auth/safe-redirect";

type PageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const redirectTo = safeAuthRedirectUrl(sp.redirect_url);
  const clerkOn = isClerkEnabled();

  if (!clerkOn) {
    return (
      <div className="mx-auto flex min-h-[70dvh] max-w-2xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-xl border border-border bg-card p-6">
          <h1 className="font-heading text-xl font-semibold">Giriş</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            E-posta ve şifre ile giriş yapabilirsin. Hesabını hatırlayacağız.
          </p>
          <div className="mt-4">
            <DemoSignInForm redirectTo={redirectTo} />
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <Link href="/forgot-password" className="text-accent hover:underline">
              Şifremi unuttum
            </Link>
            <span>
              Hesabın yok mu?{" "}
              <Link
                href={`/sign-up?redirect_url=${encodeURIComponent(redirectTo)}`}
                className="text-accent hover:underline"
              >
                Kayıt ol
              </Link>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-6xl flex-col items-center justify-center gap-4 px-4 py-10">
      <SignIn
        forceRedirectUrl={redirectTo}
        fallbackRedirectUrl={redirectTo}
        signUpForceRedirectUrl={redirectTo}
        signUpFallbackRedirectUrl={redirectTo}
        appearance={{
          elements: {
            card: "bg-card border border-border shadow-xl",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            formButtonPrimary: "bg-accent hover:bg-accent/90 text-accent-foreground",
            logoImage: "max-h-10 w-auto object-contain",
            logoBox: "flex justify-center",
          },
        }}
      />
      <Link
        href="/forgot-password"
        className="text-sm text-muted-foreground hover:text-accent hover:underline"
      >
        Şifremi unuttum
      </Link>
    </div>
  );
}
