"use client";

import Link from "next/link";
import { useDashboardSummary } from "@/hooks";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TYPE_USER_ROLE } from "@/types/user.type";
import type { ApiErrorState } from "@/types/api.type";

const EMPTY_DASHBOARD_SUMMARY = {
  totalAnimals: 0,
  activeAnimals: 0,
  totalSpecies: 0,
  totalDevices: 0,
  lowBatteryDevices: 0,
  deviceAlerts: [],
  totalReadings: 0,
  latestReadings: [],
  latestNotifications: [],
  degradedSources: [],
};

export function DashboardView({
  role,
}: {
  role: TYPE_USER_ROLE;
}) {
  const roleLabels: Record<TYPE_USER_ROLE, string> = {
    konservasionis_lapangan: "Konservasionis Lapangan",
    peneliti_ekologi: "Peneliti Ekologi",
    administrator_sistem: "Administrator Sistem",
    pengambil_kebijakan: "Pengambil Kebijakan",
  };

  const { data, isLoading, error, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-7 pb-8">
        <Loading label="Memuat dashboard..." />
      </div>
    );
  }

  if (error) {
    const apiError = error as unknown as ApiErrorState;
    return (
      <div className="flex flex-col gap-7 pb-8">
        <ErrorState
          kind={apiError.kind}
          message={apiError.message}
          status={apiError.status}
          errors={apiError.errors}
          onRetry={refetch}
        />
      </div>
    );
  }

  const summary = data?.data ?? EMPTY_DASHBOARD_SUMMARY;
  const isEmpty = summary.totalAnimals === 0 && summary.totalSpecies === 0 && summary.totalDevices === 0;

  return (
    <div className="flex flex-col gap-7 pb-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-700 p-6 text-white sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-sm font-medium text-emerald-100">
            WILDLIFE MONITORING SYSTEM · BT NGL
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard Pemantauan Satwa
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
            Pantau aktivitas satwa liar, kondisi perangkat GPS, dan laporan
            lapangan dalam satu tempat.
          </p>
          <p className="mt-4 text-sm text-emerald-100">
            Masuk sebagai {roleLabels[role]}
          </p>
          <Link
            href="/tracking/live-map"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
          >
            Lihat Peta Pelacakan <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-12 text-[180px] opacity-10"
        >
          🌳
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-zinc-900">
            Ringkasan Pemantauan
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Gambaran umum aktivitas pemantauan satwa.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Satwa"
            value={summary.totalAnimals.toLocaleString()}
            hint={`${summary.activeAnimals} aktif`}
            color="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Spesies"
            value={summary.totalSpecies.toLocaleString()}
            hint="Spesies terpantau"
            color="bg-lime-50 text-lime-700"
          />
          <StatCard
            label="Perangkat Aktif"
            value={summary.totalDevices.toLocaleString()}
            hint={
              summary.lowBatteryDevices > 0
                ? `${summary.lowBatteryDevices} baterai rendah`
                : "Semua normal"
            }
            color={summary.lowBatteryDevices > 0 ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}
          />
          <StatCard
            label="Pembacaan GPS"
            value={summary.totalReadings.toLocaleString()}
            hint="Data pemantauan"
            color="bg-amber-50 text-amber-700"
          />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-zinc-900">Akses Cepat</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Buka fitur pemantauan yang sering digunakan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/tracking/live-map"
            className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
              🗺️
            </span>
            <span>
              <span className="block text-sm font-semibold text-zinc-900">
                Peta Pelacakan
              </span>
              <span className="mt-1 block text-xs leading-5 text-zinc-500">
                Lihat lokasi satwa pada peta
              </span>
            </span>
            <span className="ml-auto text-zinc-400" aria-hidden="true">
              →
            </span>
          </Link>
          <Link
            href="/master-data/animals"
            className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
              🐅
            </span>
            <span>
              <span className="block text-sm font-semibold text-zinc-900">
                Data Satwa
              </span>
              <span className="mt-1 block text-xs leading-5 text-zinc-500">
                Lihat satwa yang terdaftar
              </span>
            </span>
            <span className="ml-auto text-zinc-400" aria-hidden="true">
              →
            </span>
          </Link>
          <Link
            href="/master-data/devices"
            className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
              📡
            </span>
            <span>
              <span className="block text-sm font-semibold text-zinc-900">
                Perangkat GPS
              </span>
              <span className="mt-1 block text-xs leading-5 text-zinc-500">
                Periksa status perangkat
              </span>
            </span>
            <span className="ml-auto text-zinc-400" aria-hidden="true">
              →
            </span>
          </Link>
          <Link
            href="/incidents"
            className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
              📝
            </span>
            <span>
              <span className="block text-sm font-semibold text-zinc-900">
                Laporan Insiden
              </span>
              <span className="mt-1 block text-xs leading-5 text-zinc-500">
                Lihat laporan dari lapangan
              </span>
            </span>
            <span className="ml-auto text-zinc-400" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                Peringatan Perangkat
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Perangkat yang perlu diperiksa.
              </p>
            </div>
            <Link
              href="/master-data/devices"
              className="shrink-0 text-sm font-medium text-emerald-700 hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {summary.deviceAlerts.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <EmptyState
                title="Tidak ada peringatan"
                description="Semua perangkat berfungsi normal."
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              {summary.deviceAlerts.map((alert: DeviceAlert, index: number) => (
                <div
                  key={`${alert.device_id}-${index}`}
                  className={`flex flex-wrap items-center justify-between gap-3 p-4 ${
                    index !== 0 ? "border-t border-zinc-100" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg">
                      ⚠️
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {alert.model}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Satwa ID: {alert.animal_id ?? "-"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {alert.battery_level !== null && alert.battery_level < 20
                          ? `Baterai rendah: ${alert.battery_level}%`
                          : `Sinyal lemah: ${alert.signal_strength}`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      alert.device_condition === "damaged"
                        ? "bg-red-50 text-red-700"
                        : alert.device_condition === "lost"
                        ? "bg-zinc-50 text-zinc-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {alert.device_condition}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                Lokasi Terbaru
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Aktivitas pembacaan GPS terbaru.
              </p>
            </div>
            <Link
              href="/tracking/live-map"
              className="shrink-0 text-sm font-medium text-emerald-700 hover:underline"
            >
              Buka peta
            </Link>
          </div>

          {summary.latestReadings.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <EmptyState
                title="Belum ada data GPS"
                description="Tidak ada pembacaan GPS yang tersedia saat ini."
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              {summary.latestReadings.map((reading: GpsReading, index: number) => (
                <div
                  key={`${reading.reading_id}-${index}`}
                  className={`flex items-start gap-3 p-4 ${
                    index !== 0 ? "border-t border-zinc-100" : ""
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                    📍
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-900">
                        {reading.trackingDevice?.animal?.name ?? `Device ${reading.device_id}`}
                      </p>
                      <span className="text-xs text-zinc-500">
                        {new Date(reading.recorded_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Lat: {reading.latitude}, Lon: {reading.longitude}
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      {reading.trackingDevice?.model ?? "Perangkat tidak diketahui"}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Terpantau
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

<section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              Laporan Insiden Terbaru
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Laporan yang membutuhkan perhatian.
            </p>
          </div>
          <Link
            href="/incidents"
            className="shrink-0 text-sm font-medium text-emerald-700 hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        {summary.latestNotifications.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <EmptyState
              title="Tidak ada laporan terbaru"
              description="Belum ada laporan insiden yang masuk."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {summary.latestNotifications.map((notification: Notification, index: number) => (
              <div
                key={`${notification.notif_id}-${index}`}
                className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
                  index !== 0 ? "border-t border-zinc-100" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-lg">
                    📝
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {notification.message.slice(0, 80)}
                      {notification.message.length > 80 ? "..." : ""}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {notification.notification_type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span className="text-xs text-zinc-500">
                    {new Date(notification.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      notification.notification_type === "risk_zone"
                        ? "bg-red-50 text-red-700"
                        : notification.notification_type === "device_alert"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-sky-50 text-sky-700"
                    }`}
                  >
                    {notification.notification_type.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isEmpty && (
        <p className="text-center text-xs text-zinc-400">
          Belum ada data pemantauan. Data akan muncul setelah perangkat dan satwa
          terdaftar.
        </p>
      )}
    </div>
  );
}

import type { DeviceAlert } from "@/types/tracking-device.type";
import type { GpsReading } from "@/types/gps-reading";
import type { Notification } from "@/types/notification";