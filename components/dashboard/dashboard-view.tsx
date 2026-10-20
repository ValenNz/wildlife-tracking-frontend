"use client";

import Link from "next/link";
import type { TYPE_USER_ROLE } from "@/types/user.type";

import { DUMMY_DASHBOARD_STATS } from "@/constant/dashboard/dashboardStats";
import { DUMMY_DASHBOARD_QUICK_LINKS } from "@/constant/dashboard/quickLinks";
import { DUMMY_DEVICE_ALERTS } from "@/constant/deviceAlerts/deviceAlerts";
import { DUMMY_RECENT_READINGS } from "@/constant/dashboard/recentReadings";
import { DUMMY_RECENT_INCIDENTS } from "@/constant/dashboard/recentIncidents";

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
          {DUMMY_DASHBOARD_STATS.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-zinc-500">
                  {stat.label}
                </p>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <stat.icon size={22} strokeWidth={1.8} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-zinc-500">{stat.detail}</p>
            </article>
          ))}
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
          {DUMMY_DASHBOARD_QUICK_LINKS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
                {item.icon}
              </span>
              <span>
                <span className="block text-sm font-semibold text-zinc-900">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-zinc-500">
                  {item.description}
                </span>
              </span>
              <span className="ml-auto text-zinc-400" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
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

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {DUMMY_DEVICE_ALERTS.map((alert, index) => (
              <div
                key={alert.name}
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
                      {alert.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {alert.animal}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">{alert.issue}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${alert.style}`}
                >
                  {alert.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                Lokasi Terbaru
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Contoh aktivitas pembacaan GPS.
              </p>
            </div>
            <Link
              href="/tracking/live-map"
              className="shrink-0 text-sm font-medium text-emerald-700 hover:underline"
            >
              Buka peta
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {DUMMY_RECENT_READINGS.map((reading, index) => (
              <div
                key={reading.id}
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
                      {reading.animal}
                    </p>
                    <span className="text-xs text-zinc-500">
                      {reading.time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{reading.id}</p>
                  <p className="mt-2 text-xs text-zinc-600">
                    {reading.location}
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {reading.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              Laporan Insiden Terbaru
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Contoh laporan yang membutuhkan perhatian.
            </p>
          </div>
          <Link
            href="/incidents"
            className="shrink-0 text-sm font-medium text-emerald-700 hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {DUMMY_RECENT_INCIDENTS.map((incident, index) => (
            <div
              key={incident.title}
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
                    {incident.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {incident.location}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <span className="text-xs text-zinc-500">{incident.date}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  {incident.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-zinc-400">
        Mode pratinjau · Data yang ditampilkan merupakan data dummy, bukan data
        pemantauan aktual.
      </p>
    </div>
  );
}
