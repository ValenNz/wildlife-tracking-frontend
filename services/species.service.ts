
import { api, unwrapData } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type {
  TYPE_SPECIES,
  TYPE_SPECIES_GET_ALL_RESPONSE,
  TYPE_SPECIES_GET_BY_ID_RESPONSE,
} from "@/types/species.type";

const buildGetAllResponse = (
  items: TYPE_SPECIES[],
): ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE> => ({
  success: true,
  message: "OK",
  data: {
    items,
    meta: {
      total: items.length,
      page: 1,
      per_page: items.length,
      total_pages: 1,
      total_items: items.length,
    },
  },
});

export const SPECIES_SERVICE = {
  GET_ALL: async (
    params?: Partial<QUERY_PARAMS_API_GET_ALL>,
  ): Promise<ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE>> => {
    const response = await api.get<ApiResponse<TYPE_SPECIES[]>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.GET_ALL(params)}`,
    );

    const items = unwrapData(response);

    return buildGetAllResponse(items);
  },
  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_SPECIES_GET_BY_ID_RESPONSE>> => {
    const response = await api.get<ApiResponse<TYPE_SPECIES>>(
      `${WILDLIFE_BASE_PATH}/species/${id}`,
    );

    const species = unwrapData(response);

    return {
      success: true,
      message: "OK",
      data: {
        items: species,
        meta: null,
      },
    };
  },
} as const;
