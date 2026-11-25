"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useToast } from "@/components/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { useUserById, useUserUpdate } from "@/hooks/use-users";
import { formatApiError, toApiErrorState } from "@/services/api";

import { UserForm, toUserFormState } from "../../form";

export default function UserEditPage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);

  if (!Number.isInteger(userId) || userId <= 0) notFound();

  const router = useRouter();
  const { showToast } = useToast();
  const userQuery = useUserById(userId);
  const updateMutation = useUserUpdate(userId);

  if (userQuery.isPending) return <Loading label="Memuat data pengguna..." />;

  if (userQuery.isError) {
    const error = toApiErrorState(userQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void userQuery.refetch()}
      />
    );
  }

  const user = userQuery.data?.data;

  if (!user) {
    return <EmptyState title={`Pengguna #${userId} tidak ditemukan`} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Sistem"
        title={`Ubah ${user.full_name}`}
        description="Perbarui identitas, role, atau password pengguna."
        className="mb-4"
        actions={
          <Link
            href="/users"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft transition hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali
          </Link>
        }
      />

      <div className="mx-auto w-full min-w-0 max-w-5xl">
        <UserForm
          key={user.user_id}
          initial={toUserFormState(user)}
          isCreate={false}
          isPending={updateMutation.isPending}
          submitLabel="Simpan Perubahan"
          errorMessage={
            updateMutation.error ? formatApiError(updateMutation.error, "Gagal menyimpan pengguna.") : null
          }
          onSubmit={async (payload) => {
            await updateMutation.mutateAsync(payload);
            showToast("Pengguna berhasil diperbarui.", "success");
            router.push("/users");
          }}
        />
      </div>
    </div>
  );
}
