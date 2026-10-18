import { api, unwrapData } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.type";
import type { Notification, NotificationListParams } from "@/types/notification";

const BASE = "/api/wildlife";

const isUnread = (value: boolean | number | null | undefined): boolean =>
  value === false || value === 0;

const filterNotifications = (
  notifications: Notification[],
  params?: NotificationListParams,
): Notification[] =>
  notifications.filter((notification) => {
    const matchesUnread = params?.onlyUnread !== true || isUnread(notification.is_read);

    const matchesType =
      params?.type === undefined || notification.notification_type === params.type;

    return matchesUnread && matchesType;
  });

export const getNotifications = async (
  params?: NotificationListParams,
): Promise<Notification[]> => {
  const response = await api.get<ApiResponse<Notification[]>>(
    `${BASE}/notifications`,
  );
  const payload = unwrapData(response);
  const notifications = Array.isArray(payload)
    ? (payload as Notification[])
    : [];

  return filterNotifications(notifications, params).sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );
};

export const getUnreadNotifications = async (): Promise<Notification[]> =>
  getNotifications({ onlyUnread: true });