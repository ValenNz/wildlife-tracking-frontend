"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorState } from "@/components/ui/error-state";
import type { ApiErrorKind } from "@/types/api.type";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
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
    defaultValues: { username: "", password: "", rememberMe: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFailure(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: values.username, password: values.password }),
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
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">
            Wildlife Monitoring System
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Balai Taman Nasional Gunung Leuser
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-zinc-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              aria-invalid={errors.username !== undefined}
              aria-describedby={errors.username ? "username-error" : undefined}
              {...register("username")}
              className={
                errors.username
                  ? "rounded-lg border border-red-400 px-3 py-2 text-sm outline-none"
                  : "rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
              }
            />
            {errors.username ? (
              <p id="username-error" role="alert" className="text-xs text-red-700">
                {errors.username.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Kata sandi
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password !== undefined}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
              className={
                errors.password
                  ? "rounded-lg border border-red-400 px-3 py-2 text-sm outline-none"
                  : "rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
              }
            />
            {errors.password ? (
              <p id="password-error" role="alert" className="text-xs text-red-700">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="size-3.5 rounded border-zinc-300"
              />
              Ingat saya
            </label>
            <span className="text-xs text-zinc-400">Lupa kata sandi?</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            {isSubmitting ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {failure ? (
          <div className="mt-4">
            <ErrorState
              kind={failure.kind}
              message={failure.message}
              status={failure.status}
              errors={failure.errors}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}

const resolveKind = (status: number): ApiErrorKind => {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 422) return "validation";

  return status >= 500 ? "server" : "unknown";
};