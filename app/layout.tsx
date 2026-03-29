import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthModeProvider } from "@/components/auth/auth-mode-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { CookieConsentBanner } from "@/components/layout/cookie-consent-banner";
import { Footer } from "@/components/layout/footer";
import { isClerkEnabled } from "@/lib/auth/clerk-config";
import { getPublicSiteUrl } from "@/lib/site-url";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteTitle = "Fokus — Türkiye'nin indie oyun mağazası";
const siteDescription =
  "Bağımsız oyunları keşfet, geliştiricileri destekle. Fokus, Türkiye odaklı indie oyun pazaryeri.";

const siteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: "%s · Fokus",
  },
  description: siteDescription,
  applicationName: "Fokus",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    locale: "tr_TR",
    siteName: "Fokus",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const clerkOn = isClerkEnabled();
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const themed = (
    <ThemeProvider
      attribute="class"
      forcedTheme="dark"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="min-h-0 w-full max-w-[100vw] flex-1 overflow-x-clip">
          {children}
        </main>
        <Footer />
        <CookieConsentBanner />
      </div>
    </ThemeProvider>
  );

  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`dark ${syne.variable} ${dmSans.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <AuthModeProvider clerkUi={clerkOn}>
          {clerkOn && publishableKey ? (
            <ClerkProvider publishableKey={publishableKey}>
              {themed}
            </ClerkProvider>
          ) : (
            themed
          )}
        </AuthModeProvider>
      </body>
    </html>
  );
}
