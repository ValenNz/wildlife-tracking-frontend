import { api } from "@/services/api";

import type { ApiResponse, BlobResponse } from "@/types/api.type";
import type { TYPE_MODEL_SOURCE, TYPE_SPECIES_PROFILE, TYPE_SPECIES_PROFILE_PAYLOAD, TYPE_WILDLIFE_PARAMS } from "@/types/wildlife.type";

export const WILDLIFE_SERVICE = {
  GET_ALL: async (params?: TYPE_WILDLIFE_PARAMS): Promise<ApiResponse<TYPE_SPECIES_PROFILE[]>> =>
    api.get<ApiResponse<TYPE_SPECIES_PROFILE[]>>("/wildlife/species", { params }),

  GET_BY_ID: async (id: number): Promise<ApiResponse<TYPE_SPECIES_PROFILE>> =>
    api.get<ApiResponse<TYPE_SPECIES_PROFILE>>(`/wildlife/species/${id}`),

  GET_FOR_STAFF: async (id: number): Promise<ApiResponse<TYPE_SPECIES_PROFILE>> =>
    api.get<ApiResponse<TYPE_SPECIES_PROFILE>>(`/species/${id}`),

  GET_MODEL: async (id: number, staff = false): Promise<BlobResponse> =>
    api.getBlob(staff ? `/species/${id}/model` : `/wildlife/species/${id}/model`, { timeoutMs: 60_000 }),

  UPDATE_PROFILE: async (id: number, payload: TYPE_SPECIES_PROFILE_PAYLOAD): Promise<ApiResponse<TYPE_SPECIES_PROFILE>> =>
    api.put<ApiResponse<TYPE_SPECIES_PROFILE>>(`/species/${id}`, { body: payload }),

  UPLOAD_MODEL: async (
    id: number,
    payload: { file: File; model_source: TYPE_MODEL_SOURCE; model_credit: string },
  ): Promise<ApiResponse<TYPE_SPECIES_PROFILE>> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("model_source", payload.model_source);
    formData.append("model_credit", payload.model_credit);
    return api.post<ApiResponse<TYPE_SPECIES_PROFILE>>(`/species/${id}/model`, { formData, timeoutMs: 120_000 });
  },

  DELETE_MODEL: async (id: number): Promise<ApiResponse<TYPE_SPECIES_PROFILE>> =>
    api.delete<ApiResponse<TYPE_SPECIES_PROFILE>>(`/species/${id}/model`),
} as const;
