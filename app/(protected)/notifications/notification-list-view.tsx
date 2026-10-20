
"use client";

import { AlertTriangle, Bell, CheckCircle, Cpu } from "lucide-react";
import { useMemo, useState } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { StatusBadge } from "@/components/ui/status-badge";
import { useNotifications } from "@/hooks/useNotifications";
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
          : (filters.type as NotificationType),
      onlyUnread: filters.unread === "unread",
    }),
    [filters.type, filters.unread],
  );

  const notifications = useNotifications(load);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">
          Notifikasi
        </h2>
        <p className="text-sm text-zinc-600">
          Peringatan risiko zona dan kondisi perangkat pelacak.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex min-w-[12rem] flex-col gap-1">
          <label
            htmlFor="notif-type"
            className="text-xs font-medium text-zinc-600"
          >
            Jenis
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
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-[12rem] flex-col gap-1">
          <label
            htmlFor="notif-unread"
            className="text-xs font-medium text-zinc-600"
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
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          >
            {UNREAD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {notifications.error ? (
        <ErrorState
          kind={notifications.error.kind}
          message={notifications.error.message}
          status={notifications.error.status}
          errors={notifications.error.errors}
          onRetry={notifications.refetch}
        />
      ) : notifications.isLoading ? (
        <Loading label="Memuat notifikasi..." />
      ) : notifications.isEmpty ? (
        <EmptyState
          title="Tidak ada notifikasi"
          description="Belum ada peringatan risiko zona atau perangkat yang tercatat."
        />
      ) : (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {notifications.data.map((notification) => {
            const unread =
              notification.is_read === false ||
              notification.is_read === 0;

            return (
              <li
                key={notification.notif_id}
                className={
                  unread
                    ? "border-l-4 border-emerald-700 bg-emerald-50 px-4 py-4"
                    : "border-l-4 border-transparent px-4 py-4 transition hover:bg-emerald-50/40"
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        notification.notification_type === "risk_zone"
                          ? "bg-red-100 text-red-700"
                          : notification.notification_type === "device_alert"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {notification.notification_type === "risk_zone" ? (
                        <AlertTriangle className="size-5" />
                      ) : notification.notification_type === "device_alert" ? (
                        <Cpu className="size-5" />
                      ) : (
                        <Bell className="size-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-6 text-zinc-900">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {formatDate(notification.created_at)}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge
                          label={TYPE_LABEL[notification.notification_type]}
                          variant={TYPE_VARIANT[notification.notification_type]}
                        />

                        {unread ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                            <span className="size-1.5 rounded-full bg-emerald-600" />
                            Belum dibaca
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                            <CheckCircle className="size-3.5" />
                            Sudah dibaca
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
