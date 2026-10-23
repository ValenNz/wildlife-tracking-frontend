"use client";

import { AlertTriangle, Bell, CheckCircle, Cpu } from "lucide-react";
import { useMemo, useState } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { StatusBadge } from "@/components/ui/status-badge";
import { useNotifications } from "@/hooks/notification.hook";
import { toApiErrorState } from "@/services/api-client";
import { formatDate } from "@/utils/format";
import type { NotificationType } from "@/types/notification";

const TYPE_LABEL: Record<NotificationType, string> = {
  risk_zone: "Zona Berisiko",
  device_alert: "Peringatan Perangkat",
  system: "Sistem",
};

const TYPE_VARIANT = {
  risk_zone: "danger",
  device_alert: "warning",
  system: "info",
} as const;

const TYPE_OPTIONS = [
  { label: "Semua jenis", value: "all" },
  { label: "Zona berisiko", value: "risk_zone" },
  { label: "Peringatan perangkat", value: "device_alert" },
  { label: "Sistem", value: "system" },
];

const UNREAD_OPTIONS = [
  { label: "Semua", value: "all" },
  { label: "Belum dibaca", value: "unread" },
];

export function NotificationListView() {
  const [filters, setFilters] = useState({
    type: "all",
    unread: "all",
  });

  const load = useMemo(
    () => ({
      type:
        filters.type === "all"
          ? undefined
          : (filters.type as "risk_zone" | "device_alert" | "system"),
      onlyUnread: filters.unread === "unread",
    }),
    [filters.type, filters.unread],
  );

  const { data, isLoading, error, refetch } = useNotifications(load);

  
return (
  <div className="flex flex-col gap-6">
    {/* Header */}
    <div>
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
          <Bell className="size-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Notifikasi
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Pantau peringatan risiko zona dan kondisi perangkat pelacak.
          </p>
        </div>
      </div>
    </div>

    {/* Filter */}
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-zinc-900">
          Filter Notifikasi
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Temukan notifikasi berdasarkan jenis dan status baca.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="notif-type"
            className="text-sm font-medium text-zinc-700"
          >
            Jenis Notifikasi
          </label>
          <select
            id="notif-type"
            value={filters.type}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                type: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="notif-unread"
            className="text-sm font-medium text-zinc-700"
          >
            Status Baca
          </label>
          <select
            id="notif-unread"
            value={filters.unread}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                unread: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          >
            {UNREAD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>

    {/* Konten */}
    {error ? (
      <ErrorState
        kind={toApiErrorState(error).kind}
        message={toApiErrorState(error).message}
        status={toApiErrorState(error).status}
        errors={toApiErrorState(error).errors}
        onRetry={refetch}
      />
    ) : isLoading ? (
      <div className="rounded-2xl border border-zinc-200 bg-white py-16 shadow-sm">
        <Loading label="Memuat notifikasi..." />
      </div>
    ) : !data?.data?.length ? (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Bell className="size-8" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-zinc-900">
          Tidak ada notifikasi
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
          Belum ada peringatan yang sesuai dengan filter saat ini.
          Notifikasi risiko zona dan kondisi perangkat akan muncul di sini
          ketika tersedia.
        </p>
      </div>
    ) : (
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-5 py-4">
          <div>
            <h3 className="font-semibold text-zinc-900">
              Daftar Notifikasi
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Informasi terbaru terkait pemantauan kawasan.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            {data.data.length} notifikasi
          </span>
        </div>

        <ul className="divide-y divide-zinc-100">
          {data.data.map((notification) => {
            const unread =
              notification.is_read === false ||
              notification.is_read === 0;

            const isRisk =
              notification.notification_type === "risk_zone";

            const isDevice =
              notification.notification_type === "device_alert";

            return (
              <li
                key={notification.notif_id}
                className={`px-5 py-5 transition-colors hover:bg-zinc-50 ${
                  unread ? "bg-emerald-50/50" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                      isRisk
                        ? "bg-red-100 text-red-700"
                        : isDevice
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {isRisk ? (
                      <AlertTriangle className="size-6" />
                    ) : isDevice ? (
                      <Cpu className="size-6" />
                    ) : (
                      <Bell className="size-6" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-6 text-zinc-900">
                        {notification.message}
                      </p>
                      {unread && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                          <span className="size-1.5 rounded-full bg-emerald-600" />
                          Belum dibaca
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-zinc-500">
                      {formatDate(notification.created_at)}
                    </p>

                    <div className="mt-3">
                      <StatusBadge
                        label={
                          isRisk
                            ? "Zona Berisiko"
                            : isDevice
                              ? "Peringatan Perangkat"
                              : "Sistem"
                        }
                        variant={
                          isRisk
                            ? "danger"
                            : isDevice
                              ? "warning"
                              : "info"
                        }
                      />
                    </div>

                    {!unread && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                        <CheckCircle className="size-4 text-emerald-700" />
                        Sudah dibaca
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    )}
  </div>
);
}