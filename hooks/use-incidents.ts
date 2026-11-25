"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createIncidentReport,
  getIncidentReportById,
  getIncidentReports,
  getPendingSyncReports,
  updateIncidentReport,
  getIncidentMedia,
  uploadIncidentMedia,
  updateIncidentSyncStatus,
} from "@/services/incident.service";
import type {
  IncidentSyncStatus,
  CreateIncidentReportPayload,
  IncidentReport,
  IncidentReportListParams,
  UpdateIncidentReportPayload,
} from "@/types/incident.type";
import type { ApiResponse } from "@/types/api.type";

type IncidentReportApiResponse = ApiResponse<IncidentReport[]>;

const invalidateIncidentQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["incident-reports"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
  ]);
};

export const useIncidentReports = (params?: IncidentReportListParams) => {
  return useQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports", params],
    queryFn: () => getIncidentReports(params),
  });
};

export const useInfiniteIncidentReports = (params: IncidentReportListParams) => {
  return useInfiniteQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getIncidentReports({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
  });
};

export const useIncidentReportById = (id: number) => {
  return useQuery<ApiResponse<IncidentReport | null>>({
    queryKey: ["incident-reports", id],
    queryFn: () => getIncidentReportById(id),
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
    onSuccess: async () => invalidateIncidentQueries(queryClient),
  });
};

export const useIncidentReportUpdate = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateIncidentReportPayload) =>
      updateIncidentReport(id, payload),
    onSuccess: async () => {
      await Promise.all([
        invalidateIncidentQueries(queryClient),
        queryClient.invalidateQueries({ queryKey: ["incident-reports", id] }),
      ]);
    },
  });
};

export const useIncidentMedia = (id: number) =>
  useQuery({
    queryKey: ["incident-reports", id, "media"],
    queryFn: () => getIncidentMedia(id),
    enabled: Number.isFinite(id) && id > 0,
  });

export const useIncidentMediaUpload = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, analyze }: { file: File; analyze: boolean }) =>
      uploadIncidentMedia(id, file, analyze),
    onSuccess: async () => {
      await Promise.all([
        invalidateIncidentQueries(queryClient),
        queryClient.invalidateQueries({ queryKey: ["ai-media-uploads"] }),
      ]);
    },
  });
};

export const useIncidentSyncStatusUpdate = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: IncidentSyncStatus) => updateIncidentSyncStatus(id, status),
    onSuccess: () => invalidateIncidentQueries(queryClient),
  });
};
