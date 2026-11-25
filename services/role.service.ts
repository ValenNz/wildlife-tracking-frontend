import { api } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type { TYPE_PERMISSION, TYPE_ROLE, TYPE_ROLE_PAYLOAD } from "@/types/role.type";

export const ROLE_SERVICE = {
  GET_ALL: async (): Promise<ApiResponse<TYPE_ROLE[]>> =>
    api.get<ApiResponse<TYPE_ROLE[]>>("/roles"),

  GET_PERMISSIONS: async (): Promise<ApiResponse<TYPE_PERMISSION[]>> =>
    api.get<ApiResponse<TYPE_PERMISSION[]>>("/permissions"),

  CREATE: async (payload: TYPE_ROLE_PAYLOAD): Promise<ApiResponse<TYPE_ROLE>> =>
    api.post<ApiResponse<TYPE_ROLE>>("/roles", { body: payload }),

  DELETE: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/roles/${id}`),

  ATTACH_PERMISSION: async (
    roleId: number,
    permissionId: number,
  ): Promise<ApiResponse<TYPE_ROLE>> =>
    api.post<ApiResponse<TYPE_ROLE>>(`/roles/${roleId}/permissions/${permissionId}`),

  DETACH_PERMISSION: async (
    roleId: number,
    permissionId: number,
  ): Promise<ApiResponse<TYPE_ROLE>> =>
    api.delete<ApiResponse<TYPE_ROLE>>(`/roles/${roleId}/permissions/${permissionId}`),
} as const;
