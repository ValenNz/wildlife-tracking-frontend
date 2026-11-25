"use client";

import { useState } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/button";
import { FormField, TextInput } from "@/components/form";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { useAiRecap } from "@/hooks/use-ai";
import { toApiErrorState } from "@/services/api";

import { RecapDocument } from "./recap-sections";

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return isoDay(date);
};

const PRESETS = [
  { label: "7 hari", days: 6 },
  { label: "30 hari", days: 29 },
  { label: "90 hari", days: 89 },
];

/** Rekap Data (AI -> BE): tampilan layar dan cetak/PDF dari GET /ai/recap. */
export default function AiRecapPage() {
  const [range, setRange] = useState({ start_date: daysAgo(6), end_date: isoDay(new Date()) });
  const recapQuery = useAiRecap(range);
  const recap = recapQuery.data?.data;

  return (
    <div className="recap flex flex-col gap-8">
      <div className="print:hidden">
        <PageHeader
          eyebrow="Analisis AI"
          title="Rekap Data AI"
          description="Semua yang dicatat AI dalam satu periode: satwa, individu, wajah, suara, dan ancaman. Unduh sebagai PDF untuk laporan."
          actions={
            <Button
              icon={<Printer className="size-4" />}
              disabled={!recap}
              onClick={() => window.print()}
            >
              Unduh PDF
            </Button>
          }
        />

        <section className="ui-panel p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex gap-1" role="group" aria-label="Periode cepat">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant={range.start_date === daysAgo(preset.days) ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() =>
                    setRange({ start_date: daysAgo(preset.days), end_date: isoDay(new Date()) })
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <FormField label="Dari Tanggal" htmlFor="recap-start" className="w-40">
              <TextInput
                id="recap-start"
                type="date"
                value={range.start_date}
                max={range.end_date}
                onChange={(event) =>
                  setRange((current) => ({ ...current, start_date: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Sampai Tanggal" htmlFor="recap-end" className="w-40">
              <TextInput
                id="recap-end"
                type="date"
                value={range.end_date}
                min={range.start_date}
                onChange={(event) =>
                  setRange((current) => ({ ...current, end_date: event.target.value }))
                }
              />
            </FormField>
          </div>
        </section>
      </div>

      {recapQuery.isPending ? (
        <Loading label="Menyusun rekap..." />
      ) : recapQuery.isError ? (
        <ErrorState {...toApiErrorState(recapQuery.error)} onRetry={() => void recapQuery.refetch()} />
      ) : !recap ? (
        <EmptyState title="Rekap tidak tersedia" />
      ) : (
        <RecapDocument recap={recap} />
      )}
    </div>
  );
}

