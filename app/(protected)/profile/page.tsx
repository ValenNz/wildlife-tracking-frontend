"use client";

import { useState } from "react";

import { Button } from "@/components/button";
import { FormField, FormGrid, FormSection, TextInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { usePasswordChange, useProfile, useProfileUpdate } from "@/hooks/use-profile";
import { formatApiError, getApiFieldErrors, toApiErrorState } from "@/services/api";

/** GET/PATCH /me dan PUT /me/password. */
export default function ProfilePage() {
  const { showToast } = useToast();
  const profileQuery = useProfile();
  const me = { data: profileQuery.data?.data };
  const save = useProfileUpdate();
  const password = usePasswordChange();
  const [draft, setForm] = useState<Partial<Record<"full_name" | "username" | "email" | "phone" | "address", string>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pw, setPw] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  // Nilai tampil = data backend, ditimpa yang sudah diketik pengguna.
  const form = {
    full_name: draft.full_name ?? me.data?.full_name ?? "",
    username: draft.username ?? me.data?.username ?? "",
    email: draft.email ?? me.data?.email ?? "",
    phone: draft.phone ?? me.data?.phone ?? "",
    address: draft.address ?? me.data?.address ?? "",
  };

  const field = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        eyebrow="Akun"
        title="Profil Saya"
        description="Perubahan nama dan email tampil di menu setelah login berikutnya."
      />
      {profileQuery.isPending ? (
        <Loading label="Memuat profil..." />
      ) : profileQuery.isError || !profileQuery.data?.data ? (
        <ErrorState
          kind={toApiErrorState(profileQuery.error).kind}
          message={toApiErrorState(profileQuery.error).message}
          status={toApiErrorState(profileQuery.error).status}
          errors={toApiErrorState(profileQuery.error).errors}
          onRetry={() => void profileQuery.refetch()}
        />
      ) : (
          <>
            <FormSection
              title="Data Akun"
              description={`Role ${profileQuery.data.data.name_role?.replaceAll("_", " ") ?? "-"}. Izin: ${profileQuery.data.data.permissions.join(", ")}.`}
            >
              <FormGrid columns={2}>
                <FormField label="Nama lengkap" htmlFor="me-name" error={errors.full_name}>
                  <TextInput id="me-name" value={form.full_name} onChange={field("full_name")} />
                </FormField>
                <FormField label="Username" htmlFor="me-username" error={errors.username}>
                  <TextInput id="me-username" value={form.username} onChange={field("username")} />
                </FormField>
                <FormField label="Email" htmlFor="me-email" error={errors.email}>
                  <TextInput id="me-email" type="email" value={form.email} onChange={field("email")} />
                </FormField>
                <FormField label="Telepon" htmlFor="me-phone" error={errors.phone}>
                  <TextInput id="me-phone" value={form.phone} onChange={field("phone")} />
                </FormField>
              </FormGrid>
              <FormField label="Alamat" htmlFor="me-address" error={errors.address} className="mt-4">
                <TextInput id="me-address" value={form.address} onChange={field("address")} />
              </FormField>
              <div className="mt-4 flex justify-end">
                <Button
                  loading={save.isPending}
                  onClick={() =>
                    save.mutate(
                      form,
                      {
                        onSuccess: () => {
                          setErrors({});
                          showToast("Profil disimpan.", "success");
                        },
                        onError: (error) => {
                          setErrors(getApiFieldErrors(error));
                          showToast(formatApiError(error, "Gagal menyimpan profil."), "error");
                        },
                      },
                    )
                  }
                >
                  Simpan profil
                </Button>
              </div>
            </FormSection>

            <FormSection title="Ganti Password" description="Sesi di perangkat lain akan dikeluarkan; sesi ini tetap aktif.">
              <FormGrid columns={3}>
                <FormField label="Password sekarang" htmlFor="pw-current" error={pwErrors.current_password}>
                  <TextInput id="pw-current" type="password" autoComplete="current-password" value={pw.current_password} onChange={(e) => setPw((p) => ({ ...p, current_password: e.target.value }))} />
                </FormField>
                <FormField label="Password baru" htmlFor="pw-new" error={pwErrors.password} hint="Minimal 8 karakter.">
                  <TextInput id="pw-new" type="password" autoComplete="new-password" value={pw.password} onChange={(e) => setPw((p) => ({ ...p, password: e.target.value }))} />
                </FormField>
                <FormField label="Ulangi password baru" htmlFor="pw-confirm" error={pwErrors.password_confirmation}>
                  <TextInput id="pw-confirm" type="password" autoComplete="new-password" value={pw.password_confirmation} onChange={(e) => setPw((p) => ({ ...p, password_confirmation: e.target.value }))} />
                </FormField>
              </FormGrid>
              <div className="mt-4 flex justify-end">
                <Button
                  loading={password.isPending}
                  onClick={() =>
                    password.mutate(
                      pw,
                      {
                        onSuccess: () => {
                          setPw({ current_password: "", password: "", password_confirmation: "" });
                          setPwErrors({});
                          showToast("Password diganti.", "success");
                        },
                        onError: (error) => {
                          setPwErrors(getApiFieldErrors(error));
                          showToast(formatApiError(error, "Gagal mengganti password."), "error");
                        },
                      },
                    )
                  }
                >
                  Ganti password
                </Button>
              </div>
            </FormSection>
          </>
      )}
    </div>
  );
}
