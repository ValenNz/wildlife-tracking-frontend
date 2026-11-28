import { api, buildFallbackMeta, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type {
  TYPE_WEATHER,
  TYPE_WEATHER_PARAMS,
  TYPE_WEATHER_SYNC_RESULT,
} from "@/types/weather.type";

export const WEATHER_SERVICE = {
  GET_ALL: async (params?: TYPE_WEATHER_PARAMS): Promise<ApiResponse<TYPE_WEATHER[]>> => {
    const result = await api.requestList<ApiResponse<TYPE_WEATHER[]>>(
      "GET",
      "/weather-data",
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

  SYNC: async (limit = 20): Promise<ApiResponse<TYPE_WEATHER_SYNC_RESULT>> =>
    api.post<ApiResponse<TYPE_WEATHER_SYNC_RESULT>>("/weather-data/sync", {
      body: { limit },
      timeoutMs: 120_000,
    }),
} as const;
