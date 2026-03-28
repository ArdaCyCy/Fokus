import type { UserRole } from "@prisma/client";

import { isDemoMode } from "@/lib/env";

export type AppRole = "ADMIN" | "DEVELOPER" | "USER";

function pickRole(raw: unknown): AppRole | null {
  if (typeof raw !== "string") return null;
  const role = raw.toUpperCase();
  if (role === "ADMIN" || role === "DEVELOPER" || role === "USER") return role;
  return null;
}

export function getRoleFromSessionClaims(
  claims: unknown,
  demoMode = isDemoMode()
): AppRole {
  if (!claims || typeof claims !== "object") return demoMode ? "DEVELOPER" : "USER";
  const c = claims as {
    metadata?: { role?: unknown };
    publicMetadata?: { role?: unknown };
    unsafeMetadata?: { role?: unknown };
    orgRole?: unknown;
  };

  return (
    pickRole(c.metadata?.role) ??
    pickRole(c.publicMetadata?.role) ??
    pickRole(c.unsafeMetadata?.role) ??
    pickRole(c.orgRole) ??
    (demoMode ? "DEVELOPER" : "USER")
  );
}

export function canAccessDashboard(role: AppRole | UserRole): boolean {
  return role === "ADMIN" || role === "DEVELOPER";
}

/**
 * Clerk kullanıcı kaydında public/unsafe metadata içindeki role alanını okur.
 * Dashboard ve geliştirici erişimi için Clerk Dashboard’dan `role: "DEVELOPER"` atanabilir.
 */
export function roleFromClerkMetadata(cu: {
  publicMetadata?: Record<string, unknown> | null;
  unsafeMetadata?: Record<string, unknown> | null;
} | null | undefined): Partial<{ role: UserRole }> {
  if (!cu) return {};
  const r =
    pickRole(cu.publicMetadata?.role) ?? pickRole(cu.unsafeMetadata?.role);
  if (!r) return {};
  return { role: r as UserRole };
}
