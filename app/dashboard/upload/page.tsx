import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadGameForm } from "@/components/dashboard/upload-game-form";

export default function DashboardUploadPage() {
  return (
    <Card className="bg-card/70">
      <CardHeader>
        <CardTitle>Yeni Oyun Yükle</CardTitle>
        <CardDescription>
          Oyununu taslak olarak kaydet, sonra onaya gonder.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UploadGameForm />
      </CardContent>
    </Card>
  );
}
