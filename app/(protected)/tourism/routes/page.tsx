"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { ErrorState, PageHeader } from "@/components/ui";
import { useAdminTourRoutes, useTourRouteDelete } from "@/hooks/use-tourism";
import { formatApiError, toApiErrorState } from "@/services/api";
import type { TYPE_TOUR_ROUTE } from "@/types/tourism.type";

import { getRouteColumns } from "./column";

export default function AdminRoutesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const routesQuery = useAdminTourRoutes();
  const deleteMutation = useTourRouteDelete();
  const [target, setTarget] = useState<TYPE_TOUR_ROUTE | null>(null);
  const columns = useMemo(() => getRouteColumns({ onDelete: setTarget }), []);

  if (routesQuery.error) {
    const error = toApiErrorState(routesQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void routesQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Kelola Wisata"
        title="Rute Tur"
        description="Rute, itinerary, perlengkapan, aturan, dan tarif jasa pemandu. Rute yang sudah punya pemesanan hanya dinonaktifkan, tidak dihapus."
        actions={<Button icon={<Plus className="size-4" />} onClick={() => router.push("/tourism/routes/create")}>Tambah Rute</Button>}
      />
      <section className="ui-panel overflow-hidden p-4 sm:p-5">
        <DataTable data={routesQuery.data ?? []} columns={columns} loading={routesQuery.isLoading} getRowId={(row) => String(row.route_id)} label="rute" emptyTitle="Belum ada rute" />
      </section>
      <ConfirmationDialog
        open={target !== null}
        title="Hapus rute?"
        description={<>Rute <b>{target?.name}</b> akan dihapus, atau dinonaktifkan bila sudah memiliki pemesanan/shift.</>}
        isPending={deleteMutation.isPending}
        error={deleteMutation.error ? formatApiError(deleteMutation.error, "Gagal menghapus.") : null}
        onCancel={() => setTarget(null)}
        onConfirm={() =>
          target &&
          deleteMutation.mutate(target.route_id, {
            onSuccess: (response) => {
              showToast(response?.message ?? "Rute diproses.", "success");
              setTarget(null);
            },
          })
        }
      />
    </div>
  );
}
