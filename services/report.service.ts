import { api } from "@/services/api";

import type { ApiResponse, BlobResponse } from "@/types/api.type";
import type {
  TYPE_AGGREGATE_REPORT,
  TYPE_AGGREGATE_REPORT_PAYLOAD,
} from "@/types/report.type";

const DOWNLOAD_TIMEOUT_MS = 180_000;

export const REPORT_SERVICE = {
  GET_ALL: async (): Promise<ApiResponse<TYPE_AGGREGATE_REPORT[]>> =>
    api.get<ApiResponse<TYPE_AGGREGATE_REPORT[]>>("/aggregate-reports"),

  GENERATE: async (
    payload: TYPE_AGGREGATE_REPORT_PAYLOAD,
  ): Promise<ApiResponse<TYPE_AGGREGATE_REPORT>> =>
    api.post<ApiResponse<TYPE_AGGREGATE_REPORT>>("/aggregate-reports/generate", {
      body: payload,
      timeoutMs: 120_000,
    }),

  DELETE: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/aggregate-reports/${id}`),

  DOWNLOAD: async (id: number): Promise<BlobResponse> =>
    api.getBlob(`/aggregate-reports/${id}/download`, { timeoutMs: DOWNLOAD_TIMEOUT_MS }),
} as const;

export const EXPORT_SERVICE = {
  DOWNLOAD: async (
    path: string,
    params?: { start_date?: string; end_date?: string },
  ): Promise<BlobResponse> =>
    api.getBlob(path, { params, timeoutMs: DOWNLOAD_TIMEOUT_MS }),
} as const;
