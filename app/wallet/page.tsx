import { requireAppUser } from "@/lib/auth/app-user";
import { WalletPanel } from "@/components/wallet/wallet-panel";
import { StorePageHero } from "@/components/store/store-page-hero";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ topup?: string }>;
}) {
  await requireAppUser("/wallet");
  const sp = await searchParams;
  const topup = sp.topup;

  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <StorePageHero
          eyebrow="Bakiye"
          title="Cüzdan"
          description="Bakiye ve işlem geçmişi. Kart yüklemesi İyzico sandbox / canlı anahtarlarıyla; geliştirmede isteğe bağlı test yüklemesi açık olabilir."
        />
        {topup === "iyzico_success" ? (
          <p className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-300">
            Ödeme tamamlandı. Bakiye güncellenmediyse sayfayı yenile; sorun sürerse destek ile iletişime geç.
          </p>
        ) : null}
        {topup === "cancel" ? (
          <p className="mb-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Cüzdan yükleme iptal edildi.
          </p>
        ) : null}
        <WalletPanel />
      </div>
    </div>
  );
}
