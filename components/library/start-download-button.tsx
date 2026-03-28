"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StartDownloadButton({ gameId }: { gameId: string }) {
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" className="flex-1" onClick={() => void start()} disabled={loading}>
      <Download className="size-4" />
      {loading ? "Ekleniyor..." : "İndirmeye ekle"}
    </Button>
  );
}
