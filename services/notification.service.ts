import { api } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { Notification, NotificationListParams } from "@/types/notification";

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
  params?: Partial<QUERY_PARAMS_API_GET_ALL> & NotificationListParams,
): Promise<ApiResponse<Notification[]>> => {
  const response = await api.get<Notification[]>(
    `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.NOTIFICATIONS.GET_ALL(params)}`,
  );

  const notifications = Array.isArray(response) ? (response as Notification[]) : [];

  return {
    success: true,
    message: "OK",
    data: filterNotifications(notifications, params).sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    ),
  };
};

export const getUnreadNotifications = async (): Promise<ApiResponse<Notification[]>> => {
  const response = await getNotifications({ onlyUnread: true });
  return response;
};