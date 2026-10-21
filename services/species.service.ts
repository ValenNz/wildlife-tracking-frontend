import { api } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type {
  TYPE_SPECIES,
  TYPE_SPECIES_GET_ALL_RESPONSE,
  TYPE_SPECIES_GET_BY_ID_RESPONSE,
  TYPE_SPECIES_PAYLOAD,
} from "@/types/species.type";
import type { TYPE_META_PAGGINATION } from "@/types/meta.type";

const buildGetAllResponse = (items: TYPE_SPECIES[]): ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE> => ({
  success: true,
  message: "OK",
  data: { items, meta: { total: items.length, page: 1, per_page: items.length, total_pages: 1, total_items: items.length } },
});

const buildGetByIdResponse = (item: TYPE_SPECIES | null): ApiResponse<TYPE_SPECIES_GET_BY_ID_RESPONSE> => ({
  success: true,
  message: "OK",
  data: { items: item, meta: null },
});

export const SPECIES_SERVICE = {
  GET_ALL: async (
    params?: Partial<QUERY_PARAMS_API_GET_ALL>,
  ): Promise<ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE>> => {
    const response = await api.get<TYPE_SPECIES[]>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.GET_ALL(params)}`,
    );

    const items = Array.isArray(response) ? (response as TYPE_SPECIES[]) : [];
    return buildGetAllResponse(items);
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_SPECIES_GET_BY_ID_RESPONSE>> => {
    const response = await api.get<TYPE_SPECIES>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.GET_BY_ID(id)}`,
    );

    return buildGetByIdResponse(response as TYPE_SPECIES | null);
  },

  CREATE: async (
    payload: TYPE_SPECIES_PAYLOAD,
  ): Promise<ApiResponse<TYPE_SPECIES>> => {
    return api.post<ApiResponse<TYPE_SPECIES>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.CREATE}`,
      { body: payload },
    );
  },

  UPDATE: async (
    id: number,
    payload: TYPE_SPECIES_PAYLOAD,
  ): Promise<ApiResponse<TYPE_SPECIES>> => {
    return api.put<ApiResponse<TYPE_SPECIES>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.UPDATE(id)}`,
      { body: payload },
    );
  },

  DELETE: async (id: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.DELETE(id)}`,
    );
  },
} as const;