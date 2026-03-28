import { requireAppUser } from "@/lib/auth/app-user";
import { FriendsManager } from "@/components/friends/friends-manager";
import { StorePageHero } from "@/components/store/store-page-hero";

export default async function FriendsPage() {
  await requireAppUser("/friends");
  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <StorePageHero
          eyebrow="Sosyal"
          title="Arkadaşlar"
          description="Arkadaş listesi, istekler ve engeller. Oyun davetleri için temel."
        />
        <FriendsManager />
      </div>
    </div>
  );
}
