import { MarketList } from "@/components/community/market-list";

export default function CommunityMarketPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold">Topluluk Pazari</h1>
      <p className="mt-2 text-sm text-muted-foreground">Kullanıcı envanter öğesi al/sat sistemi.</p>
      <div className="mt-6">
        <MarketList />
      </div>
    </div>
  );
}
