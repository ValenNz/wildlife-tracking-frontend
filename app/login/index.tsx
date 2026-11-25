"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Languages, Leaf } from "lucide-react";
import { z } from "zod";

import { useLogin } from "@/hooks/use-login";
import { Button } from "@/components/button";
import { FormAlert, FormField, TextInput, fieldDescribedBy } from "@/components/form";
import { ThemeToggle } from "@/components/navigation/main/theme-toggle";
import { usePreferences } from "@/components/providers/preferences-provider";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid.")
    .max(150, "Email maksimal 150 karakter."),
  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .min(6, "Password minimal 6 karakter.")
    .max(255, "Password maksimal 255 karakter."),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm({ notice }: { notice?: string }) {
  const { submit, loginError } = useLogin();
  const { locale, toggleLocale, t } = usePreferences();
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
    await submit({ email: values.email, password: values.password });
  };

  return (
    <main className="min-h-dvh w-full overflow-x-clip bg-background">
      <div className="grid min-h-dvh w-full lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-primary-dark lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(15,31,23,0.35), rgba(30,58,46,0.94)), url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85')",
            }}
          />
          <div className="absolute -right-20 -top-20 size-72 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-8 size-48 rounded-full border border-white/15" />

          <div className="relative z-10 flex items-center gap-3 text-white">
            <div className="relative size-12 shrink-0 rounded-2xl bg-white p-1.5">
              <Image
                src="/images/logo-tngl.png"
                alt="Logo Taman Nasional Gunung Leuser"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">Balai Taman Nasional</p>
              <p className="text-xs text-white/75">Gunung Leuser</p>
            </div>
          </div>

          <div className="relative z-10 max-w-md py-12 text-white">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Leaf aria-hidden="true" className="size-6" />
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              Menjaga Satwa,
              <br />
              Melindungi Alam.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/80">
              Pantau pergerakan satwa liar dan dukung upaya konservasi melalui
              sistem pemantauan berbasis GPS.
            </p>
          </div>

          <div className="relative z-10 border-t border-white/20 pt-5 text-xs text-white/70">
            Wildlife Monitoring System · TNGL
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-surface px-5 pb-8 pt-20 sm:px-10 sm:py-8 lg:px-12 xl:px-16">
          <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={t("switchLanguage")}
              title={t("switchLanguage")}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-bold uppercase tracking-wider text-ink-soft transition hover:border-primary hover:bg-surface-muted"
            >
              <Languages aria-hidden="true" className="size-4" />
              <span>{locale.toUpperCase()}</span>
            </button>
            <ThemeToggle />
          </div>
          <div className="w-full max-w-md">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="relative size-12 shrink-0 rounded-2xl bg-primary-soft p-1.5">
                <Image
                  src="/images/logo-tngl.png"
                  alt="Logo Taman Nasional Gunung Leuser"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-ink">Wildlife Monitoring</p>
                <p className="text-xs text-muted">
                  Balai Taman Nasional Gunung Leuser
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Selamat datang
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Masuk ke akun
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Masukkan email dan kata sandi untuk mengakses sistem pemantauan
                satwa liar.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
              <FormField
                label="Email"
                htmlFor="email"
                required
                error={errors.email?.message}
              >
                <TextInput
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  invalid={errors.email !== undefined}
                  aria-describedby={fieldDescribedBy(
                    "email",
                    false,
                    errors.email !== undefined,
                  )}
                  {...register("email")}
                />
              </FormField>

              <FormField
                label="Kata sandi"
                htmlFor="password"
                required
                error={errors.password?.message}
              >
                <div className="relative">
                  <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi"
                    invalid={errors.password !== undefined}
                    aria-describedby={fieldDescribedBy(
                      "password",
                      false,
                      errors.password !== undefined,
                    )}
                    className="pr-11"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    className="absolute inset-y-0 right-3 flex items-center text-primary transition hover:text-primary-dark"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="size-5" />
                    ) : (
                      <Eye aria-hidden="true" className="size-5" />
                    )}
                  </button>
                </div>
              </FormField>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink-soft">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="size-4 rounded border-line-strong accent-primary"
                />
                Ingat saya
              </label>

              {notice !== undefined && notice !== "" ? (
                <FormAlert message={notice} />
              ) : null}

              {loginError !== undefined && loginError !== null && loginError !== "" ? (
                <FormAlert message={loginError} />
              ) : null}

              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                className="mt-1 w-full"
              >
                {isSubmitting ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-line bg-surface-muted px-4 py-3 text-center text-sm text-ink-soft">
              Ingin berkunjung ke TN Gunung Leuser?{" "}
              <Link href="/register" className="font-semibold text-primary hover:text-primary-dark">
                Daftar akun pengunjung
              </Link>
            </div>

            <p className="mt-8 text-center text-xs leading-5 text-muted">
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
