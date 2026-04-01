"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DemoSignInForm({
  redirectTo = "/",
}: {
  redirectTo?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
          const res = await fetch("/api/auth/sign-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "Giriş başarısız");
          window.location.href = redirectTo;
        } catch (err) {
          setError(err instanceof Error ? err.message : "Giriş başarısız");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="space-y-2 text-left">
        <label className="text-sm text-muted-foreground">E-posta</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
      </div>
      <div className="space-y-2 text-left">
        <label className="text-sm text-muted-foreground">Sifre</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Giriş yapılıyor..." : "Giriş yap"}
      </Button>
    </form>
  );
}
