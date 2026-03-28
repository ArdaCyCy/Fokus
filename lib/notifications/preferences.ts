import { db } from "@/lib/db";

type NotificationPrefs = { desktop?: boolean; emailSales?: boolean; emailNews?: boolean };

export async function allowDesktopNotification(userId: string): Promise<boolean> {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { notificationSettings: true },
  });
  const s = u?.notificationSettings as NotificationPrefs | null;
  if (s?.desktop === false) return false;
  return true;
}
