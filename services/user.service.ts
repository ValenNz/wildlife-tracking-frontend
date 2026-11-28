import { api, buildFallbackMeta, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type { TYPE_ACTIVITY_LOG } from "@/types/activity-log.type";
import type {
  TYPE_USER_ACCOUNT,
  TYPE_USER_ACCOUNT_GET_ALL_RESPONSE,
  TYPE_USER_ACCOUNT_PARAMS,
  TYPE_USER_ACCOUNT_PAYLOAD,
  TYPE_USER_STATUS,
  TYPE_USER_TOKEN,
} from "@/types/user.type";

export const USER_SERVICE = {
  GET_ALL: async (
    params?: TYPE_USER_ACCOUNT_PARAMS,
  ): Promise<ApiResponse<TYPE_USER_ACCOUNT_GET_ALL_RESPONSE>> => {
    const result = await api.requestList<ApiResponse<TYPE_USER_ACCOUNT[]>>(
      "GET",
      "/users",
      { params },
    );
    const items = unwrapData(result.body);

    return {
      success: true,
      message: "OK",
      data: { items, meta: result.meta ?? buildFallbackMeta(items.length) },
    };
  },

  GET_BY_ID: async (id: number): Promise<ApiResponse<TYPE_USER_ACCOUNT>> =>
    api.get<ApiResponse<TYPE_USER_ACCOUNT>>(`/users/${id}`),

  CREATE: async (
    payload: TYPE_USER_ACCOUNT_PAYLOAD,
  ): Promise<ApiResponse<TYPE_USER_ACCOUNT>> =>
    api.post<ApiResponse<TYPE_USER_ACCOUNT>>("/users", { body: payload }),

  UPDATE: async (
    id: number,
    payload: Partial<TYPE_USER_ACCOUNT_PAYLOAD>,
  ): Promise<ApiResponse<TYPE_USER_ACCOUNT>> =>
    api.put<ApiResponse<TYPE_USER_ACCOUNT>>(`/users/${id}`, { body: payload }),

  UPDATE_STATUS: async (
    id: number,
    status: TYPE_USER_STATUS,
  ): Promise<ApiResponse<TYPE_USER_ACCOUNT>> =>
    api.patch<ApiResponse<TYPE_USER_ACCOUNT>>(`/users/${id}/status`, {
      body: { status },
    }),

  DELETE: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/users/${id}`),

  GET_TOKENS: async (id: number): Promise<ApiResponse<TYPE_USER_TOKEN[]>> =>
    api.get<ApiResponse<TYPE_USER_TOKEN[]>>(`/users/${id}/tokens`),

  REVOKE_TOKEN: async (id: number, tokenId: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/users/${id}/tokens/${tokenId}`),

  GET_ACTIVITY: async (id: number): Promise<ApiResponse<TYPE_ACTIVITY_LOG[]>> =>
    api.get<ApiResponse<TYPE_ACTIVITY_LOG[]>>(`/users/${id}/activity`),
} as const;
