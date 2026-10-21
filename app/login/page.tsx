"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorState } from "@/components/ui/error-state";
import type { ApiErrorKind } from "@/types/api.type";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFailure = {
  kind: ApiErrorKind;
  status: number;
  message: string;
  errors: Record<string, string[]> | null;
};

export default function LoginPage() {
  const router = useRouter();
  const [failure, setFailure] = useState<LoginFailure | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  // Di dalam onSubmit function LoginPage.tsx
const onSubmit = async (values: LoginFormValues) => {
  setFailure(null);

  try {
    // UBAH: Gunakan Next.js API Route, bukan Laravel langsung
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // UBAH INI: Kirim langsung sebagai 'email'
    body: JSON.stringify({ email: values.email, password: values.password }),
  });

    const body: unknown = await response.json().catch(() => null);

    const record =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : null;

    if (!response.ok || record?.success !== true) {
      setFailure({
        kind: response.status === 422 ? "validation" : resolveKind(response.status),
        status: response.status,
        message:
          typeof record?.message === "string"
            ? record.message
            : "Login gagal. Silakan coba lagi.",
        errors:
          typeof record?.errors === "object" && record.errors !== null
            ? (record.errors as Record<string, string[]>)
            : null,
      });
      return;
    }

    // API Route Next.js sudah menyimpan cookie, langsung redirect
    router.push("/dashboard");
    router.refresh();
  } catch {
    setFailure({
      kind: "network",
      status: 0,
      message: "Tidak dapat menghubungi server aplikasi.",
      errors: null,
    });
  }
};


return (
  <main className="flex min-h-screen items-center justify-center bg-[#f3f3f3] px-4 py-8">
    <div className="w-full max-w-[360px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5 bg-white px-5 py-8 shadow-sm sm:rounded-sm"
      >
        <div className="mb-2 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border-2 border-[#d6c58a] bg-[#f8f3d9] text-center text-xs font-bold text-[#426b45]">
            TNGL
          </div>

          <h1 className="text-left text-2xl font-bold tracking-tight text-black">
            Sign In
          </h1>
          <p className="mt-1 text-left text-xs text-zinc-600">
            Give credential to sign in your account
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-zinc-900">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email !== undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
            placeholder="Masukkan email Anda"
            className={`h-10 rounded-xl border px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#4d8050] ${
              errors.email ? "border-red-400" : "border-zinc-400"
            }`}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-red-700">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-zinc-900"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password !== undefined}
            aria-describedby={
              errors.password ? "password-error" : undefined
            }
            {...register("password")}
            placeholder="Type your password"
            className={`h-10 rounded-xl border px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#4d8050] ${
              errors.password
                ? "border-red-400"
                : "border-zinc-400"
            }`}
          />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="text-xs text-red-700"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-zinc-600">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="size-4 accent-[#4d8050]"
            />
            Remember Me
          </label>

          <button
            type="button"
            className="text-[10px] font-semibold text-zinc-800"
            onClick={() => {
              alert("Silakan hubungi administrator untuk reset kata sandi.")
            }}
          >
            FORGOT PASSWORD?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 h-11 rounded-xl bg-[#4d8050] px-4 text-sm font-bold text-white transition hover:bg-[#416e44] disabled:opacity-60"
        >
          {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>

      {failure && (
        <div className="mt-4">
          <ErrorState
            kind={failure.kind}
            message={failure.message}
            status={failure.status}
            errors={failure.errors}
          />
        </div>
      )}
    </div>
  </main>
);

}


const resolveKind = (status: number): ApiErrorKind => {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 422) return "validation";

  return status >= 500 ? "server" : "unknown";
};