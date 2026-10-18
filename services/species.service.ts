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

export const SPECIES_SERVICE = {
  GET_ALL: async (
    params?: Partial<QUERY_PARAMS_API_GET_ALL>,
  ): Promise<ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE>> => {
    return api.get<ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.GET_ALL(params)}`,
    );
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_SPECIES_GET_BY_ID_RESPONSE>> => {
    return api.get<ApiResponse<TYPE_SPECIES_GET_BY_ID_RESPONSE>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.GET_BY_ID(id)}`,
    );
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