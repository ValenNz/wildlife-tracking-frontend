import { api } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type {
  TYPE_ANIMAL,
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_GET_BY_ID_RESPONSE,
  TYPE_ANIMAL_PAYLOAD,
} from "@/types/animal.type";

const buildGetAllResponse = (items: TYPE_ANIMAL[]): ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE> => ({
  success: true,
  message: "OK",
  data: { items, meta: { total: items.length, page: 1, per_page: items.length, total_pages: 1, total_items: items.length } },
});

const buildGetByIdResponse = (item: TYPE_ANIMAL | null): ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE> => ({
  success: true,
  message: "OK",
  data: { items: item, meta: null },
});

export const ANIMAL_SERVICE = {
  GET_ALL: async (
    params?: Partial<QUERY_PARAMS_API_GET_ALL>,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE>> => {
    const response = await api.get<TYPE_ANIMAL[]>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.GET_ALL(params)}`,
    );

    const items = Array.isArray(response) ? (response as TYPE_ANIMAL[]) : [];
    return buildGetAllResponse(items);
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE>> => {
    const response = await api.get<TYPE_ANIMAL>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.GET_BY_ID(id)}`,
    );

    return buildGetByIdResponse(response as TYPE_ANIMAL | null);
  },

  CREATE: async (
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    return api.post<ApiResponse<TYPE_ANIMAL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.CREATE}`,
      { body: payload },
    );
  },

  UPDATE: async (
    id: number,
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    return api.put<ApiResponse<TYPE_ANIMAL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.UPDATE(id)}`,
      { body: payload },
    );
  },

  DELETE: async (id: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.DELETE(id)}`,
    );
  },
} as const;