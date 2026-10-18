import { api } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type {
  TYPE_USER,
  TYPE_USER_GET_ALL_RESPONSE,
  TYPE_USER_GET_BY_ID_RESPONSE,
  TYPE_USER_PAYLOAD,
} from "@/types/user.type";

export const USER_SERVICE = {
  GET_ALL: async (
    params?: Partial<QUERY_PARAMS_API_GET_ALL>,
  ): Promise<ApiResponse<TYPE_USER_GET_ALL_RESPONSE>> => {
    return api.get<ApiResponse<TYPE_USER_GET_ALL_RESPONSE>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.USER.GET_ALL(params)}`,
    );
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_USER_GET_BY_ID_RESPONSE>> => {
    return api.get<ApiResponse<TYPE_USER_GET_BY_ID_RESPONSE>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.USER.GET_BY_ID(id)}`,
    );
  },

  CREATE: async (
    payload: TYPE_USER_PAYLOAD,
  ): Promise<ApiResponse<TYPE_USER>> => {
    return api.post<ApiResponse<TYPE_USER>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.USER.CREATE}`,
      { body: payload },
    );
  },

  UPDATE: async (
    id: number,
    payload: TYPE_USER_PAYLOAD,
  ): Promise<ApiResponse<TYPE_USER>> => {
    return api.put<ApiResponse<TYPE_USER>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.USER.UPDATE(id)}`,
      { body: payload },
    );
  },

  DELETE: async (id: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.USER.DELETE(id)}`,
    );
  },
} as const;