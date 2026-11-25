"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/button";
import { FormField, TextInput } from "@/components/form";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/panel";
import {
  usePermissions,
  useRoleCreate,
  useRoleDelete,
  useRolePermissionToggle,
  useRoles,
} from "@/hooks/use-roles";
import { formatApiError, getApiFieldErrors, toApiErrorState } from "@/services/api";
import { BUILT_IN_ROLES, type TYPE_PERMISSION, type TYPE_ROLE } from "@/types/role.type";

/** Matriks role x izin: centang langsung menyimpan lewat POST/DELETE /roles/{id}/permissions/{permissionId}. */
export default function RolesPage() {
  const { showToast } = useToast();
  const rolesQuery = useRoles();
  const permissionsQuery = usePermissions();
  const toggleMutation = useRolePermissionToggle();
  const createMutation = useRoleCreate();
  const deleteMutation = useRoleDelete();
  const roleRows = rolesQuery.data?.data ?? [];
  const permissions = permissionsQuery.data?.data ?? [];
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name_role: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<TYPE_ROLE | null>(null);

  const toggle = (role: TYPE_ROLE, permission: TYPE_PERMISSION, on: boolean) =>
    toggleMutation.mutate(
      { roleId: role.role_id, permissionId: permission.permission_id, enabled: on },
      {
        onSuccess: () => showToast(`${permission.name_permission} ${on ? "diberikan ke" : "dicabut dari"} ${role.name_role}.`, "success"),
        onError: (error) => showToast(formatApiError(error, "Gagal mengubah izin."), "error"),
      },
    );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Sistem"
        title="Role & Izin"
        description="Izin menentukan endpoint yang boleh dipanggil tiap role. Perubahan langsung berlaku untuk semua pengguna role tersebut. Role bawaan tidak bisa diganti nama atau dihapus, dan admin tidak bisa mencabut izin kelola role miliknya sendiri."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>
            Tambah role
          </Button>
        }
      />

      {rolesQuery.isPending ? (
        <Loading label="Memuat role..." />
      ) : rolesQuery.isError ? (
        <ErrorState
          kind={toApiErrorState(rolesQuery.error).kind}
          message={toApiErrorState(rolesQuery.error).message}
          status={toApiErrorState(rolesQuery.error).status}
          errors={toApiErrorState(rolesQuery.error).errors}
          onRetry={() => void rolesQuery.refetch()}
        />
      ) : roleRows.length === 0 ? (
        <EmptyState title="Belum ada role" />
      ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full min-w-[44rem] text-sm">
              <caption className="sr-only">Matriks izin per role</caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="p-3 font-semibold">Izin</th>
                  {roleRows.map((role) => (
                    <th key={role.role_id} scope="col" className="p-3 text-center font-semibold">
                      <span className="block text-ink">{role.name_role.replaceAll("_", " ")}</span>
                      <span className="font-normal">{role.users_count ?? 0} pengguna</span>
                      {!BUILT_IN_ROLES.includes(role.name_role) ? (
                        <button
                          type="button"
                          aria-label={`Hapus role ${role.name_role}`}
                          className="mx-auto mt-1 flex text-muted hover:text-danger"
                          onClick={() => setDeleting(role)}
                        >
                          <Trash2 aria-hidden="true" className="size-3.5" />
                        </button>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.permission_id} className="border-b border-line last:border-0">
                    <th scope="row" className="p-3 text-left font-normal">
                      <span className="font-semibold text-ink">{permission.name_permission}</span>
                      {permission.description ? <span className="block text-xs text-muted">{permission.description}</span> : null}
                    </th>
                    {roleRows.map((role) => {
                      const checked = role.permissions.some((item) => item.permission_id === permission.permission_id);
                      return (
                        <td key={role.role_id} className="p-3 text-center">
                          <input
                            type="checkbox"
                            className="size-4 accent-[var(--forest-deep)]"
                            aria-label={`${permission.name_permission} untuk ${role.name_role}`}
                            checked={checked}
                            disabled={toggleMutation.isPending}
                            onChange={(event) => toggle(role, permission, event.target.checked)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Tambah role" size="sm">
        <div className="flex flex-col gap-4">
          <FormField label="Nama role" htmlFor="role-name" required error={errors.name_role} hint="Huruf kecil dan garis bawah, mis. relawan_patroli.">
            <TextInput id="role-name" value={form.name_role} onChange={(event) => setForm((f) => ({ ...f, name_role: event.target.value }))} />
          </FormField>
          <FormField label="Deskripsi" htmlFor="role-desc" error={errors.description}>
            <TextInput id="role-desc" value={form.description} onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="outline" onClick={() => setCreating(false)}>Batal</Button>
            <Button
              loading={createMutation.isPending}
              onClick={() =>
                createMutation.mutate(
                  { name_role: form.name_role, description: form.description || null },
                  {
                    onSuccess: () => {
                      showToast("Role ditambahkan. Centang izinnya di tabel.", "success");
                      setCreating(false);
                      setForm({ name_role: "", description: "" });
                    },
                    onError: (error) => setErrors(getApiFieldErrors(error)),
                  },
                )
              }
            >
              Simpan role
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        open={deleting !== null}
        title={`Hapus role ${deleting?.name_role ?? ""}?`}
        description="Role yang masih dipakai pengguna tidak bisa dihapus."
        isPending={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          deleteMutation.mutate(
            deleting.role_id,
            {
              onSuccess: () => {
                showToast("Role dihapus.", "success");
                setDeleting(null);
              },
              onError: (error) => showToast(formatApiError(error, "Gagal menghapus role."), "error"),
            },
          )
        }
      />
    </div>
  );
}
