"use client";

import { useCallback } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getIncidentReports, getPendingSyncReports } from "@/services/incident-report.service";
import type { IncidentReport, IncidentReportListParams, IncidentSyncStatus } from "@/types/incident-report";
import type { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { ApiResponse } from "@/types/api.type";

type IncidentReportGetAllResponse = {
  items: IncidentReport[];
  meta: TYPE_META_PAGGINATION;
};

type IncidentReportApiResponse = ApiResponse<IncidentReport[]>;

export const useIncidentReports = (params?: IncidentReportListParams) => {
  return useQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports", params],
    queryFn: () => getIncidentReports(params),
  });
};

export const useInfiniteIncidentReports = (
  params: Omit<IncidentReportListParams, "page">,
) => {
  return useInfiniteQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getIncidentReports({ ...params, page: pageParam as number } as IncidentReportListParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // The backend doesn't provide pagination meta for incident-reports
      return undefined;
    },
  });
};

export const useIncidentReportById = (id: number) => {
  return useQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports", id],
    queryFn: () => getIncidentReports({}),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const usePendingSyncReports = () => {
  return useQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports", "pending-sync"],
    queryFn: () => getPendingSyncReports(),
  });
};