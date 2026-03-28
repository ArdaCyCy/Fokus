import { DashboardGamesTable } from "@/components/dashboard/games-table";

export default function DashboardGamesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold">Oyunlarım</h1>
        <p className="text-sm text-muted-foreground">
          Yayındaki ve taslaktaki oyunlarını yönetebileceğin tablo görünümü.
        </p>
      </div>
      <DashboardGamesTable />
    </div>
  );
}
