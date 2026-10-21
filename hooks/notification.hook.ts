"use client";

import { useCallback } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getNotifications, getUnreadNotifications } from "@/services/notification.service";
import type { Notification, NotificationListParams } from "@/types/notification";
import type { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { ApiResponse } from "@/types/api.type";

type NotificationGetAllResponse = {
  items: Notification[];
  meta: TYPE_META_PAGGINATION;
};

type NotificationApiResponse = ApiResponse<Notification[]>;

export const useNotifications = (params?: NotificationListParams) => {
  return useQuery<NotificationApiResponse>({
    queryKey: ["notifications", params],
    queryFn: () => getNotifications(params),
  });
};

export const useInfiniteNotifications = (
  params: Omit<NotificationListParams, "page">,
) => {
  return useInfiniteQuery<NotificationApiResponse>({
    queryKey: ["notifications-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getNotifications({ ...params, page: pageParam as number } as NotificationListParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // The backend doesn't provide pagination meta for notifications
      return undefined;
    },
  });
};

export const useNotificationById = (id: number) => {
  return useQuery<NotificationApiResponse>({
    queryKey: ["notifications", id],
    queryFn: () => getNotifications({ onlyUnread: false }),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useUnreadNotifications = () => {
  return useQuery<NotificationApiResponse>({
    queryKey: ["notifications-unread"],
    queryFn: () => getUnreadNotifications(),
  });
};