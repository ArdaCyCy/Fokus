const ONLINE_MS = 5 * 60 * 1000;

export function appearsOnlineForFriends(opts: {
  appearOffline: boolean;
  lastSeenAt: Date | string | null;
}): boolean {
  if (opts.appearOffline) return false;
  if (!opts.lastSeenAt) return false;
  const t =
    typeof opts.lastSeenAt === "string"
      ? new Date(opts.lastSeenAt).getTime()
      : opts.lastSeenAt.getTime();
  return Date.now() - t < ONLINE_MS;
}

/** Kendi profilinde rozet metni (gizli mod dahil). */
export function ownPresenceBadge(opts: {
  appearOffline: boolean;
  lastSeenAt: Date | null;
}): { text: string; online: boolean; stealth: boolean } {
  if (opts.appearOffline) {
    return { text: "Gizli mod", online: false, stealth: true };
  }
  if (!opts.lastSeenAt) {
    return { text: "Çevrim dışı", online: false, stealth: false };
  }
  const online = Date.now() - opts.lastSeenAt.getTime() < ONLINE_MS;
  return {
    text: online ? "Çevrim içi" : "Çevrim dışı",
    online,
    stealth: false,
  };
}
