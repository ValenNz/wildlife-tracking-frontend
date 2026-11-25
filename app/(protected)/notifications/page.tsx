"use client";

import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Info,
  RadioTower,
  Shield,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { usePreferences, useUserRole } from "@/components/providers/preferences-provider";
import { useToast } from "@/components/toast";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/status";
import {
  useDeleteAllReadNotifications,
  useMarkAllNotificationsAsRead,
  useNotifications,
  useMarkNotificationAsRead,
} from "@/hooks/use-notifications";
import { formatApiError, toApiErrorState } from "@/services/api";
import { Button } from "@/components/button";
import { formatDate } from "@/utils/format";
import type { NotificationType } from "@/types/notification.type";
import type { TYPE_USER_ROLE } from "@/types/auth.type";
import { cn } from "@/lib/utils";

type NotificationItem = {
  notif_id: number;
  message: string;
  notification_type: NotificationType;
  is_read: boolean | number;
  created_at: string;
};

const ALLOWED_TYPES_BY_ROLE: Record<TYPE_USER_ROLE, NotificationType[]> = {
  administrator_sistem: ["risk_zone", "device_alert", "system"],
  konservasionis_lapangan: ["risk_zone", "device_alert", "system"],
  peneliti_ekologi: ["risk_zone", "device_alert", "system"],
  pengambil_kebijakan: ["risk_zone", "system"],
  petugas_loket: ["system"],
  pengunjung: ["system"],
};

export default function NotificationListPage() {
  const role = useUserRole();
  const { locale, t } = usePreferences();
  const [filters, setFilters] = useState({
    type: "all",
    unread: "all",
  });

  const allowedTypes = useMemo<NotificationType[]>(
    () => (role ? ALLOWED_TYPES_BY_ROLE[role] : ["system"]),
    [role],
  );

  const typeOptions = useMemo(() => {
    const allOptions: { value: "all" | NotificationType; label: string }[] = [
      { value: "all", label: t("notifAll") },
      { value: "risk_zone", label: t("notifRiskZone") },
      { value: "device_alert", label: t("notifDeviceAlert") },
      { value: "system", label: t("notifSystem") },
    ];
    return allOptions.filter(
      (option) => option.value === "all" || allowedTypes.includes(option.value),
    );
  }, [allowedTypes, t]);

  const unreadOptions = useMemo(
    () => [
      { label: t("notifAll"), value: "all" },
      { label: t("notifUnread"), value: "unread" },
    ],
    [t],
  );

  const description = useMemo(() => {
    if (role === "pengunjung" || role === "petugas_loket") {
      return t("notifDescTourism");
    }
    if (role === "pengambil_kebijakan") {
      return t("notifDescPolicy");
    }
    return t("notifDescConservation");
  }, [role, t]);

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

  const { data, isLoading, error, refetch } = useNotifications(load);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteAllRead = useDeleteAllReadNotifications();
  const { showToast } = useToast();

  const notifications = (data?.data as NotificationItem[]) ?? [];

  const unreadCount = notifications.filter(
    (n) => n.is_read === false || n.is_read === 0,
  ).length;

  const getNotificationConfig = (type: NotificationType) => {
    switch (type) {
      case "risk_zone":
        return {
          icon: AlertTriangle,
          label: t("notifRiskZone"),
          variant: "danger" as const,
          iconBg: "bg-danger-soft",
          iconColor: "text-danger",
        };
      case "device_alert":
        return {
          icon: RadioTower,
          label: t("notifDeviceAlert"),
          variant: "warning" as const,
          iconBg: "bg-warning-soft",
          iconColor: "text-warning",
        };
      case "system":
      default:
        return {
          icon: Info,
          label: t("notifSystem"),
          variant: "info" as const,
          iconBg: "bg-primary-soft",
          iconColor: "text-primary",
        };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={t("notifEyebrow")}
        title={t("notifTitle")}
        description={description}
        actions={
          <>
            <Button
              variant="outline"
              icon={<CheckCheck className="size-4" />}
              loading={markAllAsRead.isPending}
              onClick={() =>
                markAllAsRead.mutate(undefined, {
                  onSuccess: () => showToast(t("notifMarkAllOk"), "success"),
                  onError: (mutationError) =>
                    showToast(formatApiError(mutationError, t("notifMarkAllErr")), "error"),
                })
              }
            >
              {t("notifMarkAll")}
            </Button>
            <Button
              variant="outline"
              icon={<Trash2 className="size-4" />}
              loading={deleteAllRead.isPending}
              onClick={() =>
                deleteAllRead.mutate(undefined, {
                  onSuccess: () => showToast(t("notifDeleteReadOk"), "success"),
                  onError: (mutationError) =>
                    showToast(formatApiError(mutationError, t("notifDeleteReadErr")), "error"),
                })
              }
            >
              {t("notifDeleteRead")}
            </Button>
          </>
        }
      />

      <section className="ui-panel p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink">
                {locale === "en" ? "Filter Notifications" : "Filter Notifikasi"}
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                {locale === "en"
                  ? "Filter notifications by category and read status."
                  : "Temukan notifikasi berdasarkan jenis dan status baca."}
              </p>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-dark">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {unreadCount} {t("unreadCountLabel")}
                  </span>
                )}
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-ink-soft">
                  {notifications.length} total
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {typeOptions.length > 2 ? (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <label className="text-xs font-semibold text-ink-soft">
                    {locale === "en" ? "Type:" : "Jenis:"}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {typeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFilters((current) => ({
                            ...current,
                            type: option.value,
                          }))
                        }
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                          filters.type === option.value
                            ? "bg-primary text-white shadow-sm"
                            : "bg-surface-muted text-ink-soft hover:bg-line hover:text-ink",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
              </>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <label className="text-xs font-semibold text-ink-soft">
                Status:
              </label>
              <div className="flex gap-1.5">
                {unreadOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        unread: option.value,
                      }))
                    }
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                      filters.unread === option.value
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface-muted text-ink-soft hover:bg-line hover:text-ink",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <ErrorState
          kind={toApiErrorState(error).kind}
          message={toApiErrorState(error).message}
          status={toApiErrorState(error).status}
          errors={toApiErrorState(error).errors}
          onRetry={refetch}
        />
      ) : isLoading ? (
        <div className="ui-panel py-16">
          <Loading label={locale === "en" ? "Loading notifications..." : "Memuat notifikasi..."} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="ui-panel px-6 py-20 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft to-primary-soft/50 ring-1 ring-primary/20">
            <Bell className="size-10 text-primary" />
          </div>

          <h3 className="mt-6 text-lg font-bold text-ink">
            {locale === "en" ? "No notifications" : "Tidak ada notifikasi"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {t("notifEmpty")}
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
            <Shield className="size-4" />
            <span>{locale === "en" ? "Active monitoring 24/7" : "Sistem pemantauan aktif 24/7"}</span>
          </div>
        </div>
      ) : (
        <section className="overflow-hidden ui-panel">
          <ul className="divide-y divide-line">
            {notifications.map((notification) => {
              const unread =
                notification.is_read === false || notification.is_read === 0;
              const config = getNotificationConfig(notification.notification_type);
              const Icon = config.icon;

              return (
                <li
                  key={notification.notif_id}
                  className={cn(
                    "group relative px-5 py-4 transition-colors",
                    unread
                      ? "bg-primary-soft/30 hover:bg-primary-soft/50"
                      : "bg-surface hover:bg-surface-muted/50",
                  )}
                >
                  {unread && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                    />
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        config.iconBg,
                        config.iconColor,
                      )}
                    >
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm leading-6",
                              unread
                                ? "font-semibold text-ink"
                                : "font-medium text-ink-soft",
                            )}
                          >
                            {notification.message}
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <StatusBadge
                              label={config.label}
                              variant={config.variant}
                            />
                            <span className="text-xs text-muted">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                        </div>

                        {unread ? (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead.mutate(Number(notification.notif_id), {
                                onSuccess: () => {
                                  showToast(
                                    locale === "en"
                                      ? "Notification marked as read."
                                      : "Notifikasi berhasil ditandai sudah dibaca.",
                                    "success",
                                  );
                                },
                                onError: (mutationError: unknown) => {
                                  showToast(
                                    formatApiError(
                                      mutationError,
                                      locale === "en"
                                        ? "Failed to mark notification as read."
                                        : "Gagal menandai notifikasi sudah dibaca.",
                                    ),
                                    "error",
                                  );
                                },
                              })
                            }
                            disabled={markAsRead.isPending}
                            className="shrink-0 rounded-lg border border-primary/30 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark transition hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {markAsRead.isPending
                              ? locale === "en"
                                ? "Processing..."
                                : "Memproses..."
                              : t("notifMarkOne")}
                          </button>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
                            <CheckCircle2 className="size-3.5" />
                            {t("notifReadBadge")}
                          </span>
                        )}
                      </div>
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
