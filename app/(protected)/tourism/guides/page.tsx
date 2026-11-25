"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { ErrorState, PageHeader } from "@/components/ui";
import { useAdminTourGuides, useTourGuideDelete } from "@/hooks/use-tourism";
import { formatApiError, toApiErrorState } from "@/services/api";
import type { TYPE_TOUR_GUIDE } from "@/types/tourism.type";

import { getGuideColumns } from "./column";
import { GuideFormModal } from "./form";

export default function AdminGuidesPage() {
  const { showToast } = useToast();
  const guidesQuery = useAdminTourGuides();
  const deleteMutation = useTourGuideDelete();
  const [editing, setEditing] = useState<TYPE_TOUR_GUIDE | null | "new">(null);
  const [target, setTarget] = useState<TYPE_TOUR_GUIDE | null>(null);
  const columns = useMemo(() => getGuideColumns({ onEdit: setEditing, onDelete: setTarget }), []);

  if (guidesQuery.error) {
    const error = toApiErrorState(guidesQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void guidesQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Kelola Wisata"
        title="Pemandu Wisata"
        description="Profil publik pemandu: bio, bahasa, satwa favorit, fun fact. Kontak pribadi tidak disimpan di profil publik."
        actions={<Button icon={<Plus className="size-4" />} onClick={() => setEditing("new")}>Tambah Pemandu</Button>}
      />
      <section className="ui-panel overflow-hidden p-4 sm:p-5">
        <DataTable data={guidesQuery.data ?? []} columns={columns} loading={guidesQuery.isLoading} getRowId={(row) => String(row.guide_id)} label="pemandu" emptyTitle="Belum ada pemandu" />
      </section>
      {editing !== null ? <GuideFormModal guide={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmationDialog
        open={target !== null}
        title="Hapus pemandu?"
        description={<>Pemandu <b>{target?.display_name}</b> dihapus, atau dinonaktifkan bila sudah punya shift.</>}
        isPending={deleteMutation.isPending}
        error={deleteMutation.error ? formatApiError(deleteMutation.error, "Gagal menghapus.") : null}
        onCancel={() => setTarget(null)}
        onConfirm={() =>
          target &&
          deleteMutation.mutate(target.guide_id, {
            onSuccess: (response) => {
              showToast(response?.message ?? "Pemandu diproses.", "success");
              setTarget(null);
            },
          })
        }
      />
    </div>
  );
}
