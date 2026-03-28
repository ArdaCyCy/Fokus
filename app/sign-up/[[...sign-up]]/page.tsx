import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { DemoSignUpForm } from "@/components/auth/demo-signup-form";
import { isClerkEnabled } from "@/lib/auth/clerk-config";
import { safeAuthRedirectUrl } from "@/lib/auth/safe-redirect";

type PageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const redirectTo = safeAuthRedirectUrl(sp.redirect_url);
  const clerkOn = isClerkEnabled();

  if (!clerkOn) {
    return (
      <div className="mx-auto flex min-h-[70dvh] max-w-2xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-xl border border-border bg-card p-6">
          <h1 className="font-heading text-xl font-semibold">Kayıt ol</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nickname, e-posta ve şifre ile hesap oluştur.
          </p>
          <div className="mt-4">
            <DemoSignUpForm redirectTo={redirectTo} />
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Zaten hesabın var mı?{" "}
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent(redirectTo)}`}
              className="text-accent hover:underline"
            >
              Giriş yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-6xl items-center justify-center px-4 py-10">
      <SignUp
        forceRedirectUrl={redirectTo}
        fallbackRedirectUrl={redirectTo}
        signInForceRedirectUrl={redirectTo}
        signInFallbackRedirectUrl={redirectTo}
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
    </div>
  );
}
