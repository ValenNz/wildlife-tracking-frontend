"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Leaf,
  Map,
  MapPin,
  PawPrint,
  Radio,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/status";
import type { BadgeVariant } from "@/components/status";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import type { ApiErrorState } from "@/types/api.type";
import type { TYPE_USER_ROLE } from "@/types/auth.type";
import {
  DEVICE_CONDITION_LABELS,
  type DeviceAlert,
  type DeviceCondition,
} from "@/types/device.type";
import type { IncidentReport } from "@/types/incident.type";
import type { GpsReading } from "@/types/tracking.type";
import { useUserRole } from "@/components/providers/preferences-provider";
import { formatDate } from "@/utils/format";

const EMPTY_DASHBOARD_SUMMARY = {
  totalAnimals: 0,
  activeAnimals: 0,
  totalSpecies: 0,
  totalDevices: 0,
  lowBatteryDevices: 0,
  deviceAlerts: [] as DeviceAlert[],
  totalReadings: 0,
  latestReadings: [] as GpsReading[],
  latestNotifications: [],
  latestIncidentReports: [] as IncidentReport[],
  degradedSources: [],
};

const ROLE_LABELS: Record<TYPE_USER_ROLE, string> = {
  konservasionis_lapangan: "Konservasionis Lapangan",
  peneliti_ekologi: "Peneliti Ekologi",
  administrator_sistem: "Administrator Sistem",
  pengambil_kebijakan: "Pengambil Kebijakan",
  petugas_loket: "Petugas Loket",
  pengunjung: "Pengunjung",
};

const QUICK_LINKS = [
  {
    href: "/tracking/live-map",
    title: "Peta Pelacakan",
    description: "Lihat lokasi satwa pada peta",
    icon: <Map aria-hidden="true" className="size-5" />,
  },
  {
    href: "/animals",
    title: "Data Satwa",
    description: "Lihat satwa yang terdaftar",
    icon: <PawPrint aria-hidden="true" className="size-5" />,
  },
  {
    href: "/devices",
    title: "Perangkat GPS",
    description: "Periksa status perangkat",
    icon: <Radio aria-hidden="true" className="size-5" />,
  },
  {
    href: "/incidents",
    title: "Laporan Insiden",
    description: "Lihat laporan dari lapangan",
    icon: <ClipboardList aria-hidden="true" className="size-5" />,
  },
];

const deviceVariant = (condition: string): BadgeVariant => {
  if (condition === "damaged") return "danger";
  if (condition === "lost") return "neutral";
  return "success";
};

const deviceConditionLabel = (condition: string): string =>
  DEVICE_CONDITION_LABELS[condition as DeviceCondition] ?? condition;

const syncVariant = (status: string): BadgeVariant => {
  if (status === "synced") return "success";
  if (status === "pending_sync") return "warning";
  return "danger";
};

const syncLabel = (status: string): string => {
  if (status === "synced") return "Tersinkron";
  if (status === "pending_sync") return "Menunggu Sinkron";
  return "Gagal Sinkron";
};

export default function DashboardPage() {
  const role: TYPE_USER_ROLE = useUserRole() ?? "konservasionis_lapangan";
  const { data, isLoading, error, refetch } = useDashboardSummary();

  if (isLoading) {
    return <Loading label="Memuat dashboard..." />;
  }

  if (error) {
    const apiError = error as unknown as ApiErrorState;

    return (
      <ErrorState
        kind={apiError.kind}
        message={apiError.message}
        status={apiError.status}
        errors={apiError.errors}
        onRetry={refetch}
      />
    );
  }

  const summary = data?.data ?? EMPTY_DASHBOARD_SUMMARY;
  const isEmpty =
    summary.totalAnimals === 0 &&
    summary.totalSpecies === 0 &&
    summary.totalDevices === 0;

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[1.9rem] sm:leading-tight">
            {ROLE_LABELS[role]} Dashboard
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
            Ringkasan pergerakan satwa liar, status perangkat pelacak GPS, serta laporan aktivitas lapangan terkini.
          </p>
        </div>

        <Link
          href="/tracking/live-map"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          <span>Buka Live Map &amp; 3D</span>
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </header>

      <section>
        <SectionHeader
          title="Ringkasan Pemantauan"
          description="Gambaran umum aktivitas pemantauan satwa."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Satwa"
            value={summary.totalAnimals.toLocaleString()}
            hint={`${summary.activeAnimals} aktif`}
            tone="positive"
            icon={<PawPrint aria-hidden="true" className="size-4" />}
          />
          <StatCard
            label="Spesies"
            value={summary.totalSpecies.toLocaleString()}
            hint="Spesies terpantau"
            icon={<Leaf aria-hidden="true" className="size-4" />}
          />
          <StatCard
            label="Perangkat Aktif"
            value={summary.totalDevices.toLocaleString()}
            hint={
              summary.lowBatteryDevices > 0
                ? `${summary.lowBatteryDevices} baterai rendah`
                : "Semua normal"
            }
            tone={summary.lowBatteryDevices > 0 ? "warning" : "info"}
            icon={<Radio aria-hidden="true" className="size-4" />}
          />
          <StatCard
            label="Pembacaan GPS"
            value={summary.totalReadings.toLocaleString()}
            hint="Data pemantauan"
            tone="info"
            icon={<MapPin aria-hidden="true" className="size-4" />}
          />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Akses Cepat"
          description="Pintasan langsung ke modul pemantauan utama."
        />
        <div className="grid grid-cols-1 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <span className="shrink-0 text-primary/80 transition-colors group-hover:text-primary">
                {link.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-ink">
                  {link.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {link.description}
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted/70 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel padded={false}>
          <div className="p-5 sm:p-6">
            <SectionHeader
              title="Peringatan Perangkat"
              description="Perangkat yang perlu diperiksa."
              action={
                <Link
                  href="/devices"
                  className="text-sm font-semibold text-primary transition hover:text-primary-dark"
                >
                  Lihat semua
                </Link>
              }
              className="mb-0"
            />
          </div>
          {summary.deviceAlerts.length === 0 ? (
            <EmptyState
              title="Tidak ada peringatan"
              description="Semua perangkat berfungsi normal."
              className="rounded-none border-0 border-t border-line shadow-none"
            />
          ) : (
            <ul className="divide-y divide-line">
              {summary.deviceAlerts.map((alert, index) => (
                <li
                  key={`${alert.device_id}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <AlertTriangle aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {alert.model}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Satwa ID: {alert.animal_id ?? "-"}
                      </p>
                      <p className="mt-1 text-xs font-medium text-ink-soft">
                        {alert.battery_level !== null && alert.battery_level < 20
                          ? `Baterai rendah: ${alert.battery_level}%`
                          : `Sinyal lemah: ${alert.signal_strength}`}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    label={deviceConditionLabel(alert.device_condition)}
                    variant={deviceVariant(alert.device_condition)}
                  />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel padded={false}>
          <div className="p-5 sm:p-6">
            <SectionHeader
              title="Lokasi Terbaru"
              description="Aktivitas pembacaan GPS terbaru."
              action={
                <Link
                  href="/tracking/live-map"
                  className="text-sm font-semibold text-primary transition hover:text-primary-dark"
                >
                  Buka peta
                </Link>
              }
              className="mb-0"
            />
          </div>
          {summary.latestReadings.length === 0 ? (
            <EmptyState
              title="Belum ada data GPS"
              description="Tidak ada pembacaan GPS yang tersedia saat ini."
              className="rounded-none border-0 border-t border-line shadow-none"
            />
          ) : (
            <ul className="divide-y divide-line">
              {summary.latestReadings.map((reading, index) => (
                <li
                  key={`${reading.reading_id}-${index}`}
                  className="flex items-start gap-3 px-5 py-4 sm:px-6"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <MapPin aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-ink">
                        {reading.device?.animal?.name_animal ??
                          reading.device?.animal?.name ??
                          `Device ${reading.device_id}`}
                      </p>
                      <span className="text-xs text-muted">
                        {new Date(reading.recorded_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      Lat: {reading.latitude}, Lon: {reading.longitude}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {reading.device?.model ?? "Perangkat tidak diketahui"}
                    </p>
                    <StatusBadge
                      label="Terpantau"
                      variant="success"
                      className="mt-2"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel padded={false}>
        <div className="p-5 sm:p-6">
          <SectionHeader
            title="Laporan Insiden Terbaru"
            description="Laporan yang membutuhkan perhatian."
            action={
              <Link
                href="/incidents"
                className="text-sm font-semibold text-primary transition hover:text-primary-dark"
              >
                Lihat semua
              </Link>
            }
            className="mb-0"
          />
        </div>
        {summary.latestIncidentReports.length === 0 ? (
          <EmptyState
            title="Tidak ada laporan terbaru"
            description="Belum ada laporan insiden yang masuk."
            className="rounded-none border-0 border-t border-line shadow-none"
          />
        ) : (
          <ul className="divide-y divide-line">
            {summary.latestIncidentReports.map((report) => (
              <li
                key={report.report_id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <ClipboardList aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {report.incident_type.replaceAll("_", " ")}
                      {report.animal_code ? ` - ${report.animal_code}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">{report.description}</p>
                    <p className="mt-1 text-xs text-muted">
                      Lokasi: {report.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span className="text-xs text-muted">
                    {formatDate(report.timestamp)}
                  </span>
                  <StatusBadge
                    label={syncLabel(report.sync_status)}
                    variant={syncVariant(report.sync_status)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {isEmpty ? (
        <p className="text-center text-xs text-muted">
          Belum ada data pemantauan. Data akan muncul setelah perangkat dan satwa
          terdaftar.
        </p>
      ) : null}
    </div>
  );
}
