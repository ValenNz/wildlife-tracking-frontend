"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  Check,
  RadioTower,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  useMarkNotificationAsRead,
  useUnreadNotifications,
} from "@/hooks/use-notifications";
import {
  initNotificationAudioUnlock,
  isNotificationSoundMuted,
  playCriticalAlarm,
  playNotificationChime,
  setNotificationSoundMuted,
} from "@/lib/notification-sound";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types/api.type";
import type { Notification } from "@/types/notification.type";

type PopupItem = {
  notification: Notification;
  critical: boolean;
  receivedAt: number;
};

const CRITICAL_KEYWORDS_REGEX =
  /\[critical\]|\[high\]|\bkritis\b|\bcritical\b|\bdarurat\b|\bsos\b|\bancaman\b|\bsenjata\b|\bpemburu\b|\bperburuan\b|\bpoach|\bgergaji\b|\bchainsaw\b|\btembakan\b|\bgunshot\b|\bbahaya\b|\bbaterai kritis\b|\bbattery critical\b/i;

export function isCriticalNotification(notification: Notification): boolean {
  const message = notification.message ?? "";

  if (CRITICAL_KEYWORDS_REGEX.test(message)) {
    return true;
  }

  if (notification.notification_type === "risk_zone") {
    return !/\[low\]/i.test(message);
  }

  return false;
}

export function LiveNotificationPopup() {
  const { locale } = usePreferences();
  const queryClient = useQueryClient();
  // Keep polling active while the user is inside the protected shell.
  useUnreadNotifications();
  const markAsRead = useMarkNotificationAsRead();

  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [muted, setMuted] = useState<boolean>(() => isNotificationSoundMuted());

  const seenIdsRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    initNotificationAudioUnlock();
  }, []);

  const dismissPopup = useCallback((notifId: number) => {
    setPopups((current) =>
      current.filter((item) => item.notification.notif_id !== notifId),
    );
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      setNotificationSoundMuted(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const processSnapshot = (payload: ApiResponse<Notification[]> | undefined) => {
      if (payload === undefined) return;
      const items = payload.data ?? [];

      // First payload establishes the baseline so existing unread items don't spam on page load.
      if (!initializedRef.current) {
        for (const item of items) {
          seenIdsRef.current.add(item.notif_id);
        }
        initializedRef.current = true;
        return;
      }

      const incoming: PopupItem[] = [];
      for (const item of items) {
        const isUnread = item.is_read === false || item.is_read === 0;
        if (!isUnread) continue;
        if (seenIdsRef.current.has(item.notif_id)) continue;

        seenIdsRef.current.add(item.notif_id);
        incoming.push({
          notification: item,
          critical: isCriticalNotification(item),
          receivedAt: Date.now(),
        });
      }

      if (incoming.length === 0) return;

      const hasCritical = incoming.some((entry) => entry.critical);
      if (hasCritical) {
        playCriticalAlarm();
      } else {
        playNotificationChime();
      }

      setPopups((current) => [...incoming, ...current].slice(0, 4));
    };

    // Seed baseline if query already resolved before mount.
    processSnapshot(
      queryClient.getQueryData<ApiResponse<Notification[]>>([
        "notifications-unread",
      ]),
    );

    return queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === "updated" &&
        event.action.type === "success" &&
        Array.isArray(event.query.queryKey) &&
        event.query.queryKey[0] === "notifications-unread"
      ) {
        processSnapshot(
          event.query.state.data as ApiResponse<Notification[]> | undefined,
        );
      }
    });
  }, [queryClient]);

  // Auto-dismiss timers: critical alerts stay longer (12s), normal alerts stay 6.5s.
  useEffect(() => {
    if (popups.length === 0) return;

    const timers = popups.map((item) => {
      const ttlMs = item.critical ? 12_000 : 6_500;
      const elapsed = Date.now() - item.receivedAt;
      const remaining = Math.max(1_000, ttlMs - elapsed);

      return window.setTimeout(() => {
        dismissPopup(item.notification.notif_id);
      }, remaining);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [popups, dismissPopup]);

  if (popups.length === 0) return null;

  return (
    <div
      aria-label={locale === "en" ? "Incoming notifications" : "Notifikasi masuk"}
      className="pointer-events-none fixed right-4 top-16 z-[180] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2.5 print:hidden"
    >
      {popups.map(({ notification, critical }) => {
        const isDevice = notification.notification_type === "device_alert";
        const Icon = critical
          ? AlertTriangle
          : isDevice
            ? RadioTower
            : Bell;

        const categoryLabel = critical
          ? locale === "en"
            ? "CRITICAL"
            : "KRITIS"
          : isDevice
            ? locale === "en"
              ? "Device Alert"
              : "Alert Perangkat"
            : locale === "en"
              ? "Notification"
              : "Notifikasi";

        return (
          <div
            key={notification.notif_id}
            role={critical ? "alert" : "status"}
            aria-live={critical ? "assertive" : "polite"}
            className={cn(
              "pointer-events-auto relative overflow-hidden rounded-lg border bg-surface p-3.5 shadow-lg transition-all",
              critical
                ? "border-danger/60 ring-1 ring-danger/25"
                : isDevice
                  ? "border-warning/50"
                  : "border-line",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-y-0 left-0 w-1",
                critical
                  ? "bg-danger"
                  : isDevice
                    ? "bg-warning"
                    : "bg-primary",
              )}
            />

            <div className="flex items-start gap-3 pl-1.5">
              <div
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
                  critical
                    ? "bg-danger-soft text-danger"
                    : isDevice
                      ? "bg-warning-soft text-warning"
                      : "bg-primary-soft text-primary",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold tracking-wide",
                        critical
                          ? "bg-danger text-white"
                          : isDevice
                            ? "bg-warning-soft text-warning"
                            : "bg-primary-soft text-primary-dark",
                      )}
                    >
                      {critical ? (
                        <span
                          aria-hidden="true"
                          className="size-1.5 animate-pulse rounded-full bg-white"
                        />
                      ) : null}
                      {categoryLabel}
                    </span>
                    <span className="text-[11px] text-muted">
                      {locale === "en" ? "Just now" : "Baru saja"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={toggleMute}
                      title={
                        muted
                          ? locale === "en"
                            ? "Unmute alert sound"
                            : "Aktifkan suara notifikasi"
                          : locale === "en"
                            ? "Mute alert sound"
                            : "Bisukan suara notifikasi"
                      }
                      aria-label={
                        muted
                          ? locale === "en"
                            ? "Unmute alert sound"
                            : "Aktifkan suara notifikasi"
                          : locale === "en"
                            ? "Mute alert sound"
                            : "Bisukan suara notifikasi"
                      }
                      className="rounded p-1 text-muted transition hover:bg-surface-muted hover:text-ink"
                    >
                      {muted ? (
                        <VolumeX aria-hidden="true" className="size-3.5" />
                      ) : (
                        <Volume2 aria-hidden="true" className="size-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => dismissPopup(notification.notif_id)}
                      aria-label={
                        locale === "en" ? "Dismiss notification" : "Tutup pop-up"
                      }
                      className="rounded p-1 text-muted transition hover:bg-surface-muted hover:text-ink"
                    >
                      <X aria-hidden="true" className="size-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-1.5 line-clamp-3 text-[13px] leading-snug text-ink">
                  {notification.message}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <Link
                    href="/notifications"
                    onClick={() => dismissPopup(notification.notif_id)}
                    className={cn(
                      "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition",
                      critical
                        ? "bg-danger text-white hover:opacity-90"
                        : "bg-primary text-white hover:bg-primary-dark",
                    )}
                  >
                    {locale === "en" ? "View" : "Lihat"}
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      markAsRead.mutate(Number(notification.notif_id));
                      dismissPopup(notification.notif_id);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-soft transition hover:border-line-strong hover:text-ink"
                  >
                    <Check aria-hidden="true" className="size-3" />
                    {locale === "en" ? "Mark read" : "Tandai dibaca"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
