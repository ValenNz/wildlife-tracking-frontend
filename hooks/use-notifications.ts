"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteAllReadNotifications,
  deleteNotification,
  getNotificationById,
  getNotifications,
  getUnreadNotificationCount,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notification.service";
import type { ApiResponse } from "@/types/api.type";
import type {
  Notification,
  NotificationListParams,
} from "@/types/notification.type";

type NotificationApiResponse = ApiResponse<Notification[]>;

const NOTIFICATIONS_KEY = ["notifications"] as const;

const invalidateNotificationQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
    queryClient.invalidateQueries({ queryKey: ["notifications-unread"] }),
    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] }),
    queryClient.invalidateQueries({ queryKey: ["notifications-infinite"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
  ]);
};

export const useNotifications = (params?: NotificationListParams) =>
  useQuery<NotificationApiResponse>({
    queryKey: [...NOTIFICATIONS_KEY, params],
    queryFn: () => getNotifications(params),
  });

export const useInfiniteNotifications = (
  params: Omit<NotificationListParams, "page">,
) =>
  useInfiniteQuery<NotificationApiResponse>({
    queryKey: ["notifications-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getNotifications({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
  });

export const useNotificationById = (id: number) =>
  useQuery({
    queryKey: [...NOTIFICATIONS_KEY, id],
    queryFn: () => getNotificationById(id),
    enabled: Number.isFinite(id) && id > 0,
  });

export const useUnreadNotifications = () =>
  useQuery<NotificationApiResponse>({
    queryKey: ["notifications-unread"],
    queryFn: () => getUnreadNotifications(),
    refetchInterval: 8_000,
    refetchOnWindowFocus: true,
  });

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => getUnreadNotificationCount(),
  });

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: async () => invalidateNotificationQueries(queryClient),
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: async () => invalidateNotificationQueries(queryClient),
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: async () => invalidateNotificationQueries(queryClient),
  });
};

export const useDeleteAllReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAllReadNotifications(),
    onSuccess: async () => invalidateNotificationQueries(queryClient),
  });
};
