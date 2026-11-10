
"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createIncidentReport,
  getIncidentReports,
  getPendingSyncReports,
} from "@/services/incident-report.service";
import type {
  IncidentReport,
  IncidentReportListParams,
} from "@/types/incident-report";
import type { ApiResponse } from "@/types/api.type";
import type { CreateIncidentReportPayload } from "@/services/incident-report.service";

type IncidentReportApiResponse = ApiResponse<IncidentReport[]>;

export const useIncidentReports = (
  params?: IncidentReportListParams,
) => {
  return useQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports", params],
    queryFn: () => getIncidentReports(params),
  });
};

export const useInfiniteIncidentReports = (
  params: IncidentReportListParams,
) => {
  return useInfiniteQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getIncidentReports({
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
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

export const useCreateIncidentReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateIncidentReportPayload) =>
      createIncidentReport(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["incident-reports"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard-summary"],
      });
    },
  });
};
