"use client";

import Link from "next/link";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { useIncidentReports } from "@/hooks/useIncidentReports";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeviceAlerts, ReadingFeed } from "@/components/wildlife/device-alerts";
import { formatDate, formatNumber } from "@/utils/format";
import type { TYPE_USER_ROLE } from "@/types/user.type";

type QuickLink = {
  label: string;
  href: string;
  hint: string;
};

const QUICK_LINKS: Record<TYPE_USER_ROLE, QuickLink[]> = {
  konservasionis_lapangan: [
    { label: "Live Map", href: "/tracking/live-map", hint: "Posisi satwa terkini" },
    { label: "Laporan Insiden", href: "/incidents", hint: "Catat kejadian lapangan" },
  ],
  peneliti_ekologi: [
    { label: "Spesies", href: "/master-data/species", hint: "Data spesies endemik" },
    { label: "Live Map", href: "/tracking/live-map", hint: "Riwayat pergerakan" },
  ],
  administrator_sistem: [
    { label: "Perangkat", href: "/master-data/devices", hint: "Kelola collar GPS" },
    { label: "Satwa", href: "/master-data/animals", hint: "Kelola data satwa" },
  ],
  pengambil_kebijakan: [
    { label: "Statistik", href: "/master-data/species", hint: "Ringkasan konservasi" },
    { label: "Satwa", href: "/master-data/animals", hint: "Rekap jumlah satwa" },
  ],
};

const QuickLinks = ({ links }: { links: QuickLink[] }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-zinc-400"
      >
        <p className="text-sm font-medium text-zinc-900">{link.label}</p>
        <p className="text-xs text-zinc-500">{link.hint}</p>
      </Link>
    ))}
  </div>
);

export function DashboardView({ role }: { role: TYPE_USER_ROLE }) {
  const summary = useDashboardSummary();
  const incidents = useIncidentReports();

  if (summary.isLoading && summary.error === null) {
    return <Loading label="Memuat ringkasan dashboard..." />;
  }

  if (summary.error) {
    return (
      <ErrorState
        kind={summary.error.kind}
        message={summary.error.message}
        status={summary.error.status}
        errors={summary.error.errors}
        onRetry={summary.refetch}
      />
    );
  }

  const { data } = summary;

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Metrik utama" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Satwa"
          value={formatNumber(data.totalAnimals)}
          hint={`${formatNumber(data.activeAnimals)} aktif`}
        />
        <StatCard
          label="Spesies"
          value={formatNumber(data.totalSpecies)}
          tone="positive"
        />
        <StatCard
          label="Perangkat Aktif"
          value={formatNumber(data.totalDevices)}
          tone={data.lowBatteryDevices > 0 ? "warning" : "neutral"}
          hint={`${formatNumber(data.lowBatteryDevices)} baterai lemah`}
        />
        <StatCard
          label="Pembacaan GPS"
          value={formatNumber(data.totalReadings)}
          hint="100 data terbaru"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Akses Cepat
        </h2>
        <QuickLinks links={QUICK_LINKS[role]} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Peringatan Perangkat
          </h2>
          <Link
            href="/master-data/devices"
            className="text-xs font-medium text-zinc-600 underline-offset-2 hover:underline"
          >
            Lihat semua
          </Link>
        </div>
        <DeviceAlerts alerts={data.deviceAlerts} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Lokasi Terbaru
        </h2>
        {data.latestReadings.length > 0 ? (
          <ReadingFeed readings={data.latestReadings} />
        ) : (
          <EmptyState
            title="Belum ada pembacaan GPS"
            description="Backend belum mengembalikan data lokasi."
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Laporan Insiden Terbaru
          </h2>
          <Link
            href="/incidents"
            className="text-xs font-medium text-zinc-600 underline-offset-2 hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        {incidents.error ? (
          <ErrorState
            kind={incidents.error.kind}
            message={incidents.error.message}
            status={incidents.error.status}
            errors={incidents.error.errors}
            onRetry={incidents.refetch}
          />
        ) : incidents.isEmpty ? (
          <EmptyState
            title="Belum ada laporan insiden"
            description="Endpoint /api/incidents merespons kosong."
          />
        ) : (
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {incidents.data.slice(0, 5).map((report) => (
              <li
                key={report.report_id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium text-zinc-900">{report.incident_type}</span>
                <span className="text-xs text-zinc-600">{report.location}</span>
                <StatusBadge
                  label={report.sync_status}
                  variant={
                    report.sync_status === "synced"
                      ? "success"
                      : report.sync_status === "failed"
                        ? "danger"
                        : "warning"
                  }
                />
                <span className="text-xs text-zinc-500">
                  {formatDate(report.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}