import { api } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type {
  TYPE_PASSWORD_PAYLOAD,
  TYPE_PROFILE,
  TYPE_PROFILE_PAYLOAD,
} from "@/types/user.type";

export const PROFILE_SERVICE = {
  GET: async (): Promise<ApiResponse<TYPE_PROFILE>> =>
    api.get<ApiResponse<TYPE_PROFILE>>("/me"),

  UPDATE: async (payload: TYPE_PROFILE_PAYLOAD): Promise<ApiResponse<TYPE_PROFILE>> =>
    api.patch<ApiResponse<TYPE_PROFILE>>("/me", { body: payload }),

  /** Sesi lain milik user dikeluarkan; sesi yang sedang dipakai tetap aktif. */
  CHANGE_PASSWORD: async (payload: TYPE_PASSWORD_PAYLOAD): Promise<ApiResponse<null>> =>
    api.put<ApiResponse<null>>("/me/password", { body: payload }),
} as const;
