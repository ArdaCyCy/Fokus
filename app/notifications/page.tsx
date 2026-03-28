import { requireAppUser } from "@/lib/auth/app-user";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { StorePageHero } from "@/components/store/store-page-hero";

export default async function NotificationsPage() {
  await requireAppUser("/notifications");
  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-4xl px-4">
        <StorePageHero
          eyebrow="Gelen kutusu"
          title="Bildirimler"
          description="Mağaza, kütüphane ve topluluk bildirimleri."
        />
        <NotificationsList />
      </div>
    </div>
  );
}
