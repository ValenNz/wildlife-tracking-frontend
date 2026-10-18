"use client";

import { useCallback } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { getNotifications } from "@/services/notification.service";
import type { AsyncResource } from "@/hooks/useAsyncResource";
import type { Notification, NotificationListParams } from "@/types/notification";

const EMPTY_NOTIFICATIONS: Notification[] = [];

export const useNotifications = (
  params?: NotificationListParams,
): AsyncResource<Notification[]> => {
  const { onlyUnread, type } = params ?? {};

  const load = useCallback(
    () => getNotifications({ onlyUnread, type }),
    [onlyUnread, type],
  );

  return useAsyncResource(
    load,
    EMPTY_NOTIFICATIONS,
    (notifications) => notifications.length === 0,
  );
};