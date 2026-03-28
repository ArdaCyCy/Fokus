import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardSettingsPage() {
  return (
    <Card className="bg-card/70">
      <CardHeader>
        <CardTitle>Ayarlar</CardTitle>
        <CardDescription>Profil, magaza ve guvenlik ayarlarini yonet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>Hesap detaylari, profil foto, cerceve ve arka plan ayarlari ana ayarlar sayfasinda aktif.</p>
        <Button asChild>
          <Link href="/settings">Ayarlar Sayfasina Git</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
