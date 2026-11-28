"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Compass, Eye, EyeOff, RefreshCw, ShieldCheck, Ticket, Trees } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/button";
import { FormAlert, FormField, TextInput, fieldDescribedBy } from "@/components/form";
import { useRegister } from "@/hooks/use-register";
import { registerChallengeAction } from "@/services/backend-actions";
import type { TYPE_REGISTER_CHALLENGE } from "@/types/auth.type";

const registerSchema = z
  .object({
    full_name: z.string().trim().min(3, "Nama minimal 3 karakter.").max(100, "Nama maksimal 100 karakter."),
    username: z
      .string()
      .trim()
      .min(3, "Username minimal 3 karakter.")
      .max(50, "Username maksimal 50 karakter.")
      .regex(/^[A-Za-z0-9_-]+$/, "Hanya huruf, angka, garis bawah, dan tanda hubung."),
    email: z.string().trim().min(1, "Email wajib diisi.").email("Format email tidak valid.").max(150),
    phone: z
      .string()
      .trim()
      .max(30, "Nomor maksimal 30 karakter.")
      .refine((value) => value === "" || /^[0-9+\-\s()]{8,30}$/.test(value), "Format nomor tidak valid."),
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter.")
      .max(255)
      .regex(/[A-Za-z]/, "Kata sandi harus mengandung huruf.")
      .regex(/[0-9]/, "Kata sandi harus mengandung angka."),
    password_confirmation: z.string().min(1, "Ulangi kata sandi."),
    agree: z.boolean().refine((value) => value, "Setujui ketentuan kunjungan terlebih dahulu."),
    captcha_answer: z.string().trim().regex(/^-?\d{1,3}$/, "Isi jawaban berupa angka."),
    website: z.string(),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Konfirmasi kata sandi tidak sama.",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;
type FieldKey = Exclude<keyof RegisterFormValues, "agree" | "website">;

const PERKS = [
  { icon: Compass, title: "Pilih rute & jadwal", text: "Bukit Lawang, Tangkahan, Ketambe — lengkap dengan itinerary." },
  { icon: Ticket, title: "Tiket QR resmi", text: "Tarif PNBP PP 36/2024 dihitung otomatis oleh sistem." },
  { icon: ShieldCheck, title: "Pemandu bersertifikat", text: "Lihat profil dan shift pemandu sebelum memesan." },
];

export default function RegisterForm() {
  const { submit, registerError, fieldErrors } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [challenge, setChallenge] = useState<TYPE_REGISTER_CHALLENGE>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
      agree: false,
      captcha_answer: "",
      website: "",
    },
  });


  const loadChallenge = useCallback(async () => {
    setChallengeError(null);
    const result = await registerChallengeAction();
    if (result.ok) setChallenge(result.challenge);
    else setChallengeError(result.message);
    setValue("captcha_answer", "");
  }, [setValue]);

  useEffect(() => {
    queueMicrotask(() => void loadChallenge());
  }, [loadChallenge]);


  useEffect(() => {
    for (const [field, message] of Object.entries(fieldErrors)) {
      setError(field as FieldKey, { type: "server", message });
    }
  }, [fieldErrors, setError]);

  const onSubmit = async (values: RegisterFormValues) => {
    const ok = await submit({
      full_name: values.full_name,
      username: values.username,
      email: values.email,
      phone: values.phone,
      password: values.password,
      password_confirmation: values.password_confirmation,
      captcha_token: challenge?.challenge_token ?? "",
      captcha_answer: values.captcha_answer,
      website: values.website,
    });
    if (!ok) void loadChallenge();
  };

  const textField = (
    key: FieldKey,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
    required = true,
  ) => (
    <FormField label={label} htmlFor={key} required={required} error={errors[key]?.message}>
      <TextInput
        id={key}
        invalid={errors[key] !== undefined}
        aria-describedby={fieldDescribedBy(key, false, errors[key] !== undefined)}
        {...props}
        {...register(key)}
      />
    </FormField>
  );

  return (
    <main className="min-h-dvh w-full overflow-x-clip bg-background">
      <div className="grid min-h-dvh w-full lg:grid-cols-[1fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-primary-dark lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(15,31,23,0.3), rgba(30,58,46,0.95)), url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85')",
            }}
          />
          <div className="relative z-10 flex items-center gap-3 text-white">
            <div className="relative size-12 shrink-0 rounded-2xl bg-white p-1.5">
              <Image src="/images/logo-tngl.png" alt="Logo Taman Nasional Gunung Leuser" fill sizes="48px" className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold">Balai Taman Nasional</p>
              <p className="text-xs text-white/75">Gunung Leuser</p>
            </div>
          </div>

          <div className="relative z-10 max-w-md py-10 text-white">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Trees aria-hidden="true" className="size-6" />
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              Jelajahi Leuser,
              <br />
              bersama penjaganya.
            </h1>
            <ul className="mt-8 flex flex-col gap-5">
              {PERKS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/12 text-white">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-sm leading-6 text-white/75">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 border-t border-white/20 pt-5 text-xs text-white/70">
            Sebagian tiket masuk adalah PNBP yang disetor ke kas negara.
          </div>
        </section>

        <section className="flex items-center justify-center bg-surface px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-lg">
            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Akun pengunjung</p>
              <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Daftar &amp; pesan tur</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Akun ini khusus wisatawan untuk memesan tiket, melihat jadwal pemandu, dan menulis ulasan.
                Data konservasi tidak dapat diakses dari akun pengunjung.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
              {textField("full_name", "Nama lengkap", { autoComplete: "name", placeholder: "Sesuai identitas" })}
              <div className="grid gap-4 sm:grid-cols-2">
                {textField("username", "Username", { autoComplete: "username", placeholder: "mis. rina_hiker" })}
                {textField("phone", "No. HP / WhatsApp", { type: "tel", autoComplete: "tel", placeholder: "08xxxxxxxxxx" }, false)}
              </div>
              {textField("email", "Email", { type: "email", autoComplete: "email", placeholder: "nama@email.com" })}
              <div className="grid gap-4 sm:grid-cols-2">
                {textField("password", "Kata sandi", {
                  type: showPassword ? "text" : "password",
                  autoComplete: "new-password",
                  placeholder: "Min. 8, huruf & angka",
                })}
                {textField("password_confirmation", "Ulangi kata sandi", {
                  type: showPassword ? "text" : "password",
                  autoComplete: "new-password",
                })}
              </div>
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
              >
                {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                {showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              </button>

              {challenge ? (
                <FormField label={`Soal keamanan: ${challenge.question}`} htmlFor="captcha_answer" required error={errors.captcha_answer?.message}>
                  <div className="flex gap-2">
                    <TextInput
                      id="captcha_answer"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="Jawaban"
                      invalid={errors.captcha_answer !== undefined}
                      className="max-w-40"
                      {...register("captcha_answer")}
                    />
                    <button type="button" onClick={() => void loadChallenge()} className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium text-ink-soft hover:border-primary" aria-label="Ganti soal">
                      <RefreshCw className="size-4" /> Ganti soal
                    </button>
                  </div>
                </FormField>
              ) : challengeError ? (
                <FormAlert message={challengeError} />
              ) : null}


              <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
                <label htmlFor="website">Website</label>
                <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-6 text-ink-soft">
                <input type="checkbox" {...register("agree")} className="mt-1 size-4 rounded border-line-strong accent-primary" />
                <span>
                  Saya akan mematuhi aturan kawasan konservasi: tidak memberi makan atau menyentuh satwa,
                  tidak meninggalkan sampah, dan selalu didampingi pemandu.
                </span>
              </label>
              {errors.agree?.message ? <p className="-mt-2 text-sm text-danger">{errors.agree.message}</p> : null}

              {registerError ? <FormAlert message={registerError} /> : null}

              <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 w-full">
                {isSubmitting ? "Mendaftarkan..." : "Daftar sebagai Pengunjung"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-primary-dark">
                Masuk di sini
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
