"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/button";
import {
  FormActions,
  FormAlert,
  FormField,
  FormGrid,
  FormSection,
  SelectInput,
  TextInput,
} from "@/components/form";
import { useRoles } from "@/hooks/use-roles";
import { firstIssueMessage, issuesToFieldErrors, type FormErrors } from "@/lib/form";
import { getApiFieldErrors } from "@/services/api";
import type { TYPE_USER_ACCOUNT, TYPE_USER_ACCOUNT_PAYLOAD } from "@/types/user.type";

export type UserFormState = {
  full_name: string;
  username: string;
  email: string;
  role_id: number;
  password: string;
  phone: string;
  address: string;
};

type FieldName = keyof UserFormState;

const USER_FIELDS: FieldName[] = [
  "full_name",
  "username",
  "email",
  "role_id",
  "password",
  "phone",
  "address",
];

export const toUserFormState = (user?: TYPE_USER_ACCOUNT | null): UserFormState => ({
  full_name: user?.full_name ?? "",
  username: user?.username ?? "",
  email: user?.email ?? "",
  role_id: user?.role_id ?? 0,
  password: "",
  phone: user?.phone ?? "",
  address: user?.address ?? "",
});

const buildSchema = (isCreate: boolean) =>
  z.object({
    full_name: z.string().trim().min(1, "Nama lengkap wajib diisi.").max(100, "Maksimal 100 karakter."),
    username: z
      .string()
      .trim()
      .min(1, "Username wajib diisi.")
      .max(50, "Maksimal 50 karakter.")
      .regex(/^[A-Za-z0-9_-]+$/, "Username hanya huruf, angka, garis bawah, atau tanda hubung."),
    email: z.string().trim().email("Format email tidak valid.").max(150, "Maksimal 150 karakter."),
    role_id: z.number().int().positive("Pilih role pengguna."),
    password: isCreate
      ? z.string().min(8, "Password minimal 8 karakter.")
      : z.string().refine((value) => value === "" || value.length >= 8, "Password minimal 8 karakter."),
    phone: z.string().max(30, "Maksimal 30 karakter."),
    address: z.string().max(255, "Maksimal 255 karakter."),
  });

type UserFormProps = {
  initial: UserFormState;
  isCreate: boolean;
  isPending: boolean;
  submitLabel: string;
  errorMessage: string | null;
  onSubmit: (payload: TYPE_USER_ACCOUNT_PAYLOAD) => Promise<void>;
};

export function UserForm({
  initial,
  isCreate,
  isPending,
  submitLabel,
  errorMessage,
  onSubmit,
}: UserFormProps) {
  const router = useRouter();
  const rolesQuery = useRoles();
  const roles = rolesQuery.data?.data ?? [];
  const [form, setForm] = useState<UserFormState>(initial);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors<FieldName>>({});

  const setField = <K extends FieldName>(key: K, value: UserFormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setValidationError(null);
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    const parsed = buildSchema(isCreate).safeParse(form);

    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues, USER_FIELDS));
      setValidationError(firstIssueMessage(parsed.error.issues, "Periksa kembali isian form."));
      return;
    }

    const payload: TYPE_USER_ACCOUNT_PAYLOAD = {
      full_name: parsed.data.full_name,
      username: parsed.data.username,
      email: parsed.data.email,
      role_id: parsed.data.role_id,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      ...(parsed.data.password !== "" ? { password: parsed.data.password } : {}),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error) as FormErrors<FieldName>);
    }
  };

  const summaryMessage = validationError ?? errorMessage;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormSection title="Identitas" description="Nama dan kontak petugas.">
        <FormGrid>
          <FormField label="Nama Lengkap" htmlFor="full_name" required error={fieldErrors.full_name}>
            <TextInput
              id="full_name"
              value={form.full_name}
              onChange={(event) => setField("full_name", event.target.value)}
              invalid={fieldErrors.full_name !== undefined}
              disabled={isPending}
            />
          </FormField>
          <FormField label="Telepon" htmlFor="phone" error={fieldErrors.phone}>
            <TextInput
              id="phone"
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
              invalid={fieldErrors.phone !== undefined}
              disabled={isPending}
            />
          </FormField>
        </FormGrid>
        <FormField label="Alamat" htmlFor="address" error={fieldErrors.address} className="mt-4">
          <TextInput
            id="address"
            value={form.address}
            onChange={(event) => setField("address", event.target.value)}
            invalid={fieldErrors.address !== undefined}
            disabled={isPending}
          />
        </FormField>
      </FormSection>

      <FormSection title="Akun" description="Dipakai untuk login. Role menentukan menu dan izin.">
        <FormGrid>
          <FormField label="Username" htmlFor="username" required error={fieldErrors.username}>
            <TextInput
              id="username"
              value={form.username}
              onChange={(event) => setField("username", event.target.value)}
              invalid={fieldErrors.username !== undefined}
              disabled={isPending}
            />
          </FormField>
          <FormField label="Email" htmlFor="email" required error={fieldErrors.email}>
            <TextInput
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              invalid={fieldErrors.email !== undefined}
              disabled={isPending}
            />
          </FormField>
          <FormField label="Role" htmlFor="role_id" required error={fieldErrors.role_id}>
            <SelectInput
              id="role_id"
              value={form.role_id === 0 ? "" : String(form.role_id)}
              onChange={(event) => setField("role_id", Number(event.target.value))}
              invalid={fieldErrors.role_id !== undefined}
              disabled={isPending || rolesQuery.isLoading}
            >
              <option value="">Pilih role</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.name_role.replaceAll("_", " ")}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField
            label={isCreate ? "Password" : "Password Baru"}
            htmlFor="password"
            required={isCreate}
            error={fieldErrors.password}
            hint={
              isCreate
                ? "Minimal 8 karakter."
                : "Kosongkan bila tidak diganti. Mengganti password mencabut sesi pengguna."
            }
          >
            <TextInput
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setField("password", event.target.value)}
              invalid={fieldErrors.password !== undefined}
              disabled={isPending}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {summaryMessage ? <FormAlert message={summaryMessage} /> : null}

      <FormActions>
        <Button variant="outline" onClick={() => router.push("/users")} disabled={isPending}>
          Batal
        </Button>
        <Button type="submit" loading={isPending}>
          {isPending ? "Menyimpan..." : submitLabel}
        </Button>
      </FormActions>
    </form>
  );
}
