"use client";

import { Pencil } from "lucide-react";

import { ProfileImageFileField } from "@/components/profile/profile-image-file-field";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  initialAvatarUrl: string | null;
  initialBackgroundUrl: string | null;
};

export function ProfileAppearanceEditor({
  initialAvatarUrl,
  initialBackgroundUrl,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="gap-1.5 text-xs"
        >
          <Pencil className="size-3.5" />
          Görünümü düzenle
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-3">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Profil fotoğrafı ve kapak için bilgisayarından görsel yükle.
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-4">
          <ProfileImageFileField
            label="Profil fotoğrafı"
            kind="avatar"
            currentUrl={initialAvatarUrl ?? ""}
          />
          <ProfileImageFileField
            label="Kapak / arka plan"
            kind="background"
            currentUrl={initialBackgroundUrl ?? ""}
            previewClassName="h-20 w-full max-w-[220px] shrink-0 rounded-md border border-white/[0.08] object-cover"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
