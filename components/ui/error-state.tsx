import type { ApiErrorKind } from "@/types/api.type";

const TITLES: Record<ApiErrorKind, string> = {
  unauthorized: "Sesi tidak terautentikasi (401)",
  forbidden: "Akses ditolak (403)",
  validation: "Data tidak valid (422)",
  not_found: "Data tidak ditemukan (404)",
  server: "Server bermasalah (5xx)",
  network: "Backend tidak dapat dihubungi",
  unknown: "Terjadi kesalahan",
};

const HINTS: Record<ApiErrorKind, string[]> = {
  unauthorized: [
    "Token tidak ditemukan atau sudah kedaluwarsa.",
    "Masuk kembali melalui halaman /login.",
  ],
  forbidden: ["Peran pengguna tidak memiliki izin untuk aksi ini."],
  validation: ["Periksa kembali isian yang ditandai."],
  not_found: ["Data yang diminta tidak tersedia di backend."],
  server: ["Periksa storage/logs/laravel.log pada repo backend."],
  network: [
    "Jalankan: cd wildlife-tracking-backend && php artisan serve",
    "Pastikan MySQL aktif dan php artisan migrate sudah dijalankan.",
  ],
  unknown: ["Format respons tidak sesuai kontrak API."],
};

type ErrorStateProps = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  errors?: Record<string, string[]> | null;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  kind,
  message,
  status,
  errors,
  onRetry,
  className,
}: ErrorStateProps) {
  const validationEntries = errors ? Object.entries(errors) : [];

  return (
    <div
      role="alert"
      className={
        className === undefined
          ? "flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-red-900"
          : `flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-red-900 ${className}`
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">{TITLES[kind]}</p>
        {status !== undefined && status > 0 ? (
          <span className="text-xs font-medium opacity-70">HTTP {status}</span>
        ) : null}
      </div>

      <p className="text-sm opacity-90">{message}</p>

      {validationEntries.length > 0 ? (
        <ul className="list-inside list-disc space-y-1 text-xs opacity-90">
          {validationEntries.map(([field, messages]) => (
            <li key={field}>
              <span className="font-semibold">{field}</span>: {messages.join(", ")}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="list-inside list-disc space-y-1 text-xs opacity-70">
          {HINTS[kind].map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      )}

      {onRetry ? (
        <div>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-red-900/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-red-900/20"
          >
            Coba lagi
          </button>
        </div>
      ) : null}
    </div>
  );
}