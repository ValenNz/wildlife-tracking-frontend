"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { FormField, SelectInput, TextInput } from "@/components/form";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { ErrorState, PageHeader } from "@/components/ui";
import { useAdminShifts, useAdminTourGuides, useShiftDelete, useShiftSave } from "@/hooks/use-tourism";
import { formatApiError, toApiErrorState } from "@/services/api";
import type { TYPE_GUIDE_SHIFT } from "@/types/tourism.type";
import { toLocalDateInput } from "@/utils/format";

import { getShiftColumns } from "./column";
import { ShiftFormModal } from "./form";

export default function AdminShiftsPage() {
  const { showToast } = useToast();
  const [from, setFrom] = useState(toLocalDateInput());
  const [to, setTo] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 13);
    return toLocalDateInput(date);
  });
  const [guideId, setGuideId] = useState(0);
  const params = useMemo(() => ({ from, to, guide_id: guideId || undefined }), [from, to, guideId]);
  const shiftsQuery = useAdminShifts(params);
  const guidesQuery = useAdminTourGuides();
  const saveMutation = useShiftSave();
  const deleteMutation = useShiftDelete();
  const [editing, setEditing] = useState<TYPE_GUIDE_SHIFT | null | "new">(null);
  const [target, setTarget] = useState<TYPE_GUIDE_SHIFT | null>(null);

  const columns = useMemo(
    () =>
      getShiftColumns({
        onEdit: setEditing,
        onDelete: setTarget,
        onCancel: (shift) =>
          saveMutation.mutate(
            { id: shift.shift_id, payload: { status: "cancelled" } },
            {
              onSuccess: () => showToast("Shift dibatalkan.", "success"),
              onError: (error) => showToast(formatApiError(error, "Gagal membatalkan shift."), "error"),
            },
          ),
      }),
    [saveMutation, showToast],
  );

  if (shiftsQuery.error) {
    const error = toApiErrorState(shiftsQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void shiftsQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Kelola Wisata"
        title="Shift Pemandu"
        description="Jadwal kerja pemandu per rute. Shift yang sudah memiliki pemesanan aktif tidak bisa dihapus; batalkan pemesanannya terlebih dahulu."
        actions={<Button icon={<Plus className="size-4" />} onClick={() => setEditing("new")}>Tambah Shift</Button>}
      />
      <section className="ui-panel grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
        <FormField label="Dari" htmlFor="from"><TextInput id="from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></FormField>
        <FormField label="Sampai" htmlFor="to"><TextInput id="to" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></FormField>
        <FormField label="Pemandu" htmlFor="guide">
          <SelectInput id="guide" value={guideId} onChange={(event) => setGuideId(Number(event.target.value))}>
            <option value={0}>Semua pemandu</option>
            {(guidesQuery.data ?? []).map((guide) => <option key={guide.guide_id} value={guide.guide_id}>{guide.display_name}</option>)}
          </SelectInput>
        </FormField>
      </section>
      <section className="ui-panel overflow-hidden p-4 sm:p-5">
        <DataTable data={shiftsQuery.data ?? []} columns={columns} loading={shiftsQuery.isLoading} getRowId={(row) => String(row.shift_id)} label="shift" emptyTitle="Tidak ada shift pada rentang ini" />
      </section>
      {editing !== null ? <ShiftFormModal shift={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmationDialog
        open={target !== null}
        title="Hapus shift?"
        description="Shift ini akan dihapus permanen."
        isPending={deleteMutation.isPending}
        error={deleteMutation.error ? formatApiError(deleteMutation.error, "Gagal menghapus.") : null}
        onCancel={() => setTarget(null)}
        onConfirm={() =>
          target &&
          deleteMutation.mutate(target.shift_id, {
            onSuccess: () => {
              showToast("Shift dihapus.", "success");
              setTarget(null);
            },
          })
        }
      />
    </div>
  );
}
