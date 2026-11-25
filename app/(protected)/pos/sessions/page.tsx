"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { FormField, TextInput } from "@/components/form";
import { ErrorState, PageHeader } from "@/components/ui";
import { usePosSessions } from "@/hooks/use-pos";
import { toApiErrorState } from "@/services/api";

import { getSessionColumns } from "./column";

export default function PosSessionsPage() {
  const [date, setDate] = useState("");
  const sessionsQuery = usePosSessions(date);
  const columns = useMemo(() => getSessionColumns(), []);

  if (sessionsQuery.error) {
    const error = toApiErrorState(sessionsQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void sessionsQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Loket"
        title="Riwayat Sesi Kas"
        description="Setiap sesi mencatat modal awal, penjualan, kas seharusnya, hitungan fisik, dan selisih. Kasir melihat sesinya sendiri; pengelola melihat semua kasir."
      />
      <section className="ui-panel p-4 sm:p-5">
        <FormField label="Tanggal buka" htmlFor="session-date" className="max-w-xs">
          <TextInput id="session-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </FormField>
      </section>
      <section className="ui-panel overflow-hidden p-4 sm:p-5">
        <DataTable data={sessionsQuery.data ?? []} columns={columns} loading={sessionsQuery.isLoading} getRowId={(row) => String(row.session_id)} label="sesi" emptyTitle="Belum ada sesi kas" />
      </section>
    </div>
  );
}
