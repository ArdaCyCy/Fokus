"use client";

import { useEffect, useState } from "react";

import { Tabs } from "@/components/ui/tabs";

export function LibraryTabsShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [tab, setTab] = useState("games");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyHash = () => {
      if (window.location.hash === "#indirmeler") setTab("downloads");
      else setTab("games");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const onTabChange = (next: string) => {
    setTab(next);
    if (typeof window === "undefined") return;
    if (next === "downloads") {
      if (window.location.hash !== "#indirmeler") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#indirmeler`);
      }
    } else if (window.location.hash === "#indirmeler") {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  };

  return (
    <Tabs value={tab} onValueChange={onTabChange} className={className}>
      {children}
    </Tabs>
  );
}
