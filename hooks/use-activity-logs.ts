"use client";

import { useQuery } from "@tanstack/react-query";

import { ACTIVITY_LOG_SERVICE } from "@/services/activity-log.service";
import type { TYPE_ACTIVITY_LOG_PARAMS } from "@/types/activity-log.type";

export const useActivityLogs = (params?: TYPE_ACTIVITY_LOG_PARAMS) =>
  useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => ACTIVITY_LOG_SERVICE.GET_ALL(params),
  });
