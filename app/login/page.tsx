
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
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFailure(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const body: unknown = await response.json().catch(() => null);
      const record =
        typeof body === "object" && body !== null
          ? (body as Record<string, unknown>)
          : null;

      if (!response.ok || record?.success !== true) {
        setFailure({
          kind:
            response.status === 422
              ? "validation"
              : resolveKind(response.status),
          status: response.status,
          message:
            typeof record?.message === "string"
              ? record.message
              : "Login gagal. Silakan coba lagi.",
          errors:
            typeof record?.errors === "object" &&
            record.errors !== null
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
    <main className="min-h-screen w-full bg-white">
      <div className="grid min-h-screen w-full overflow-hidden bg-white lg:grid-cols-2">
        {/* Panel gambar */}
        <section className="relative hidden min-h-[300px] overflow-hidden bg-[#416e44] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(17,54,35,0.28), rgba(17,54,35,0.88)), url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85')",
            }}
          />

          <div className="absolute -right-20 -top-20 size-72 rounded-full border border-white/15" />
          <div className="absolute -right-8 -top-8 size-48 rounded-full border border-white/20" />

          <div className="relative z-10 flex items-center gap-3 text-white">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5">
              <img
              src="/images/logo-tngl.png"
              alt="Logo Taman Nasional Gunung Leuser"
              className="h-full w-full object-contain"
              />
              </div>
            <div>
              <p className="text-sm font-semibold">Balai Taman Nasional</p>
              <p className="text-xs text-white/75">
                Gunung Leuser
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-md py-12 text-white">

            <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
              Menjaga Satwa,
              <br />
              Melindungi Alam.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/80">
              Pantau pergerakan satwa liar dan dukung upaya
              konservasi melalui sistem pemantauan berbasis GPS.
            </p>
          </div>

          <div className="relative z-10 border-t border-white/20 pt-5 text-xs text-white/70">
            Wildlife Monitoring System · TNGL
          </div>
        </section>

        {/* Panel form login */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            {/* Identitas untuk layar kecil */}
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5">
                <img
                src="/images/logo-tngl.png"
                alt="Logo Taman Nasional Gunung Leuser"
                className="h-full w-full object-contain"
                />
                </div>
              <div>
                <p className="font-semibold text-[#0f172a]">
                  Wildlife Monitoring
                </p>
                <p className="text-xs text-slate-500">
                  Balai Taman Nasional Gunung Leuser
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-[#4d8050]">
                SELAMAT DATANG
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                Masuk ke akun
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Masukkan email dan kata sandi untuk mengakses
                sistem pemantauan satwa liar.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email !== undefined}
                  aria-describedby={
                    errors.email ? "email-error" : undefined
                  }
                  {...register("email")}
                  placeholder="nama@email.com"
                  className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm text-[#0f172a] outline-none transition placeholder:text-slate-400 focus:border-[#4d8050] focus:ring-4 focus:ring-[#4d8050]/10 ${
                    errors.email
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-xs text-red-600"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Kata sandi
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={errors.password !== undefined}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    {...register("password")}
                    placeholder="Masukkan kata sandi"
                    className={`h-12 w-full rounded-2xl border bg-white px-4 pr-20 text-sm text-[#0f172a] outline-none transition placeholder:text-slate-400 focus:border-[#4d8050] focus:ring-4 focus:ring-[#4d8050]/10 ${
                      errors.password
                        ? "border-red-400"
                        : "border-slate-200"
                    }`}
                  />

                  <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-4 flex items-center text-[#4d8050] hover:text-[#416e44]"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.3" />
                        <path d="M6.2 6.2C3.9 7.6 2.7 9.7 2.5 12c.5 1.2 1.7 3.1 4.1 4.8A9.8 9.8 0 0 0 12 19c1.1 0 2.1-.2 3-.5" />
                        </svg>
                        ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                        </button>
                        </div>

                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="text-xs text-red-600"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="size-4 rounded border-slate-300 accent-[#4d8050]"
                />
                Ingat saya
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 flex h-12 w-full items-center justify-center rounded-2xl bg-[#4d8050] px-4 text-sm font-semibold text-white shadow-lg shadow-[#4d8050]/15 transition hover:bg-[#416e44] focus:outline-none focus:ring-4 focus:ring-[#4d8050]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Memproses..." : "Masuk ke Dashboard"}
              </button>
            </form>

            {failure && (
              <div className="mt-5">
                <ErrorState
                  kind={failure.kind}
                  message={failure.message}
                  status={failure.status}
                  errors={failure.errors}
                />
              </div>
            )}

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Sistem Pelacakan Pergerakan Satwa Liar
              <br />
              Balai Taman Nasional Gunung Leuser
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

const resolveKind = (status: number): ApiErrorKind => {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 422) return "validation";
  return status >= 500 ? "server" : "unknown";
};
