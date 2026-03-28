"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DashboardSignOut() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        void fetch("/api/auth/sign-out", { method: "POST" }).then(() => {
          window.location.href = "/";
        });
      }}
    >
      {loading ? "Çıkış…" : "Çıkış"}
    </Button>
  );
}
