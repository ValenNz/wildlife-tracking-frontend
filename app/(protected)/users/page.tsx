"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Download, Plus, SlidersHorizontal, UserCheck, UserX, Users } from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { DataFilters } from "@/components/filter";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { useExportDownload } from "@/hooks/use-reports";
import { useRoles } from "@/hooks/use-roles";
import { useUserDelete, useUserStatusUpdate, useUsers } from "@/hooks/use-users";
import { formatApiError, toApiErrorState } from "@/services/api";
import type { TYPE_USER_ACCOUNT, TYPE_USER_ACCOUNT_PARAMS } from "@/types/user.type";
import { saveBlob } from "@/utils/download";

import { getUserColumns } from "./column";
import { USER_INITIAL_FILTERS, getUserFilterFields, type UserFilterValues } from "./filter";

export default function UserListPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<UserFilterValues>(USER_INITIAL_FILTERS);
  const [deleting, setDeleting] = useState<TYPE_USER_ACCOUNT | null>(null);

  const params = useMemo<TYPE_USER_ACCOUNT_PARAMS>(
    () => ({
      search: filters.search.trim() || undefined,
      role_id: filters.role_id === "all" ? undefined : Number(filters.role_id),
      status:
        filters.status === "all"
          ? undefined
          : (filters.status as TYPE_USER_ACCOUNT_PARAMS["status"]),
    }),
    [filters],
  );

  const usersQuery = useUsers(params);
  const rolesQuery = useRoles();
  const statusMutation = useUserStatusUpdate();
  const deleteMutation = useUserDelete();
  const exportMutation = useExportDownload();

  const users = usersQuery.data?.data?.items ?? [];
  const roles = useMemo(() => rolesQuery.data?.data ?? [], [rolesQuery.data]);
  const filterFields = useMemo(() => getUserFilterFields(roles), [roles]);

  const columns = useMemo(
    () =>
      getUserColumns({
        onEdit: (user) => router.push(`/users/${user.user_id}/edit`),
        onToggleStatus: (user) =>
          statusMutation.mutate(
            { id: user.user_id, status: user.status === "aktif" ? "nonaktif" : "aktif" },
            {
              onSuccess: () =>
                showToast(
                  user.status === "aktif"
                    ? `${user.full_name} dinonaktifkan; sesinya dicabut.`
                    : `${user.full_name} diaktifkan.`,
                  "success",
                ),
              onError: (error) => showToast(formatApiError(error, "Gagal mengubah status."), "error"),
            },
          ),
        onDelete: setDeleting,
      }),
    [router, showToast, statusMutation],
  );

  const activeCount = users.filter((user) => user.status === "aktif").length;

  if (usersQuery.error) {
    const error = toApiErrorState(usersQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void usersQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Sistem"
        title="Pengguna"
        description="Akun petugas dan role-nya. Menonaktifkan akun atau mengganti password langsung mencabut sesi yang sedang login."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Download className="size-4" />}
              loading={exportMutation.isPending}
              onClick={() =>
                exportMutation.mutate(
                  { path: "/export/users/csv" },
                  {
                    onSuccess: (file) => saveBlob(file, "users.csv"),
                    onError: (error) => showToast(formatApiError(error, "Gagal mengekspor pengguna."), "error"),
                  },
                )
              }
            >
              Ekspor CSV
            </Button>
            <Button icon={<Plus className="size-4" />} onClick={() => router.push("/users/create")}>
              Tambah Pengguna
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Pengguna"
          value={usersQuery.isLoading ? "..." : String(users.length)}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Aktif"
          value={usersQuery.isLoading ? "..." : String(activeCount)}
          tone="positive"
          icon={<UserCheck className="size-5" />}
        />
        <StatCard
          label="Nonaktif"
          value={usersQuery.isLoading ? "..." : String(users.length - activeCount)}
          icon={<UserX className="size-5" />}
        />
      </div>

      <section className="ui-panel">
        <div className="border-b border-line bg-surface-muted px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-soft p-2 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Cari dan Filter Pengguna</h2>
              <p className="mt-1 text-sm text-muted">Berdasarkan nama, role, atau status akun.</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <DataFilters
            fields={filterFields}
            values={filters}
            onFilterChange={(values) => setFilters((previous) => ({ ...previous, ...values }))}
            onReset={() => setFilters({ ...USER_INITIAL_FILTERS })}
          />
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-ink">Daftar Pengguna</h2>
          <p className="mt-1 text-sm text-muted">{users.length} akun.</p>
        </div>
        <div className="p-4 sm:p-5">
          <DataTable
            data={users}
            columns={columns}
            loading={usersQuery.isLoading}
            getRowId={(row) => String(row.user_id)}
            label="daftar pengguna"
            emptyTitle="Tidak ada pengguna"
            emptyDescription="Ubah filter atau tambah pengguna baru."
          />
        </div>
      </section>

      <ConfirmationDialog
        open={deleting !== null}
        title="Hapus Pengguna?"
        description={
          <>
            <p>Akun berikut dihapus dan semua sesinya dicabut:</p>
            <p className="mt-2 rounded-lg bg-natural-muted/30 p-3 text-sm font-semibold text-olive-dark">
              {deleting?.full_name} (@{deleting?.username})
            </p>
            <p className="mt-3 text-xs text-danger">Data yang pernah dibuatnya tetap tersimpan.</p>
          </>
        }
        isPending={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? formatApiError(deleteMutation.error, "Gagal menghapus pengguna.")
            : null
        }
        onConfirm={() =>
          deleting &&
          deleteMutation.mutate(deleting.user_id, {
            onSuccess: () => {
              showToast("Pengguna dihapus.", "success");
              setDeleting(null);
            },
          })
        }
        onCancel={() => {
          if (deleteMutation.isPending) return;
          setDeleting(null);
          deleteMutation.reset();
        }}
      />
    </div>
  );
}
