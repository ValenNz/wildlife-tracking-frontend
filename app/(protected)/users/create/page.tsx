"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/ui/panel";
import { useUserCreate } from "@/hooks/use-users";
import { formatApiError } from "@/services/api";

import { UserForm, toUserFormState } from "../form";

export default function UserCreatePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const createMutation = useUserCreate();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Sistem"
        title="Tambah Pengguna"
        description="Buat akun petugas baru beserta role-nya."
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
          initial={toUserFormState()}
          isCreate
          isPending={createMutation.isPending}
          submitLabel="Tambah Pengguna"
          errorMessage={
            createMutation.error ? formatApiError(createMutation.error, "Gagal menambahkan pengguna.") : null
          }
          onSubmit={async (payload) => {
            await createMutation.mutateAsync(payload);
            showToast("Pengguna berhasil ditambahkan.", "success");
            router.push("/users");
          }}
        />
      </div>
    </div>
  );
}
