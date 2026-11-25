import { api, buildFallbackMeta, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type {
  TYPE_ACTIVITY_LOG,
  TYPE_ACTIVITY_LOG_PARAMS,
} from "@/types/activity-log.type";

export const ACTIVITY_LOG_SERVICE = {
  GET_ALL: async (
    params?: TYPE_ACTIVITY_LOG_PARAMS,
  ): Promise<ApiResponse<TYPE_ACTIVITY_LOG[]>> => {
    const result = await api.requestList<ApiResponse<TYPE_ACTIVITY_LOG[]>>(
      "GET",
      "/activity-logs",
      { params },
    );
    const items = unwrapData(result.body);

    return {
      success: true,
      message: "OK",
      data: items,
      meta: result.meta ?? buildFallbackMeta(items.length),
    };
  },
} as const;
