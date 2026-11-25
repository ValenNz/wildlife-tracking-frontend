import { api, buildFallbackMeta, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type {
  TYPE_ZONE_VISIT,
  TYPE_ZONE_VISIT_GET_ALL_RESPONSE,
  TYPE_ZONE_VISIT_PARAMS,
  TYPE_ZONE_VISIT_PAYLOAD,
} from "@/types/zone-visit.type";

export const ZONE_VISIT_SERVICE = {
  GET_ALL: async (
    params?: TYPE_ZONE_VISIT_PARAMS,
  ): Promise<ApiResponse<TYPE_ZONE_VISIT_GET_ALL_RESPONSE>> => {
    const result = await api.requestList<ApiResponse<TYPE_ZONE_VISIT[]>>(
      "GET",
      "/animal-geo-zone-visits",
      { params },
    );
    const items = unwrapData(result.body);

    return {
      success: true,
      message: "OK",
      data: { items, meta: result.meta ?? buildFallbackMeta(items.length) },
    };
  },

  CREATE: async (
    payload: TYPE_ZONE_VISIT_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ZONE_VISIT>> =>
    api.post<ApiResponse<TYPE_ZONE_VISIT>>("/animal-geo-zone-visits", {
      body: payload,
    }),

  EXIT: async (
    id: number,
    exitedAt?: string,
  ): Promise<ApiResponse<TYPE_ZONE_VISIT>> =>
    api.patch<ApiResponse<TYPE_ZONE_VISIT>>(`/animal-geo-zone-visits/${id}/exit`, {
      body: exitedAt ? { exited_at: exitedAt } : {},
    }),

  GET_BY_ANIMAL: async (
    animalId: number,
  ): Promise<ApiResponse<TYPE_ZONE_VISIT[]>> =>
    api.get<ApiResponse<TYPE_ZONE_VISIT[]>>(`/animals/${animalId}/zone-visits`),

  GET_BY_ZONE: async (zoneId: number): Promise<ApiResponse<TYPE_ZONE_VISIT[]>> =>
    api.get<ApiResponse<TYPE_ZONE_VISIT[]>>(`/geo-zones/${zoneId}/visits`),
} as const;
