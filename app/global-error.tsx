"use client";

import { useEffect } from "react";

/**
 * Kök layout bile hata verdiğinde kullanılır; bu yüzden kendi html/body sarmalayıcısı gerekir.
 * Stiller globals.css ile gelir (aynı build içinde).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Fokus] Global error:", error);
  }, [error]);

  return (
    <html lang="tr" className="dark">
      <body className="min-h-dvh bg-[hsl(240_35%_5%)] font-sans text-[hsl(210_25%_96%)] antialiased">
        <div
          style={{
            display: "flex",
            minHeight: "100dvh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            gap: "1.25rem",
            maxWidth: "28rem",
            margin: "0 auto",
          }}
        >
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(355 76% 56%)" }}>
            KRİTİK HATA
          </p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            Uygulama yüklenemedi
          </h1>
          <p style={{ fontSize: "0.875rem", color: "hsl(215 14% 65%)", margin: 0, lineHeight: 1.6 }}>
            Sayfayı yenile veya bir süre sonra tekrar dene. Sorun sürerse geliştirici konsoluna
            bakın.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "hsl(355 76% 56%)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
