"use client";

import { MANUAL_CHAPTERS } from "@/components/manual/manual-data";
import { NormalManualView } from "@/components/manual/normal-manual";
import { usePreferences } from "@/components/providers/preferences-provider";
import { PageHeader } from "@/components/ui/panel";

export default function UserManualPage() {
  const { locale } = usePreferences();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={locale === "en" ? "Documentation" : "Dokumentasi"}
        title={locale === "en" ? "User Manual" : "Panduan Pengguna"}
        description={
          locale === "en"
            ? "Complete guide for operating the Gunung Leuser Wildlife Monitoring & Ecotourism platform."
            : "Panduan lengkap pengoperasian platform Pemantauan Satwa & Ekowisata Gunung Leuser."
        }
        className="mb-0"
      />

      <NormalManualView chapters={MANUAL_CHAPTERS} locale={locale} />
    </div>
  );
}
