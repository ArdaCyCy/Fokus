"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DemoSignUpForm({
  redirectTo = "/",
}: {
  redirectTo?: string;
}) {
  const [nickname, setNickname] = useState("");
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
          const res = await fetch("/api/auth/sign-up", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname, email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "Kayıt başarısız");
          window.location.href = redirectTo;
        } catch (err) {
          setError(err instanceof Error ? err.message : "Kayıt başarısız");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="space-y-2 text-left">
        <label className="text-sm text-muted-foreground">Nickname</label>
        <input
          type="text"
          minLength={3}
          maxLength={32}
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
      </div>
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
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Kayıt oluşturuluyor..." : "Kayıt ol"}
      </Button>
    </form>
  );
}
