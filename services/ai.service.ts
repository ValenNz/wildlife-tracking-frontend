import { api, buildFallbackMeta, unwrapData } from "@/services/api";

import type { ApiResponse, BlobResponse } from "@/types/api.type";
import type {
  AiDetectObjectsResult,
  AiHealth,
  AiMediaUpload,
  AiMediaUploadListParams,
  AiPrediction,
  AiPredictionListParams,
  AiPredictionUploadResult,
  AiPredictionVerifyPayload,
  AiRecap,
  AiSummaryReport,
  AiSummaryReportParams,
  AiThreatListParams,
  AiUploadPayload,
  AiVocabulary,
  AnimalReferencePhoto,
  StaffFace,
  StaffFaceGroup,
} from "@/types/ai.type";

const AI_TIMEOUT_MS = 120_000;

const buildUploadFormData = (payload: AiUploadPayload): FormData => {
  const formData = new FormData();
  formData.append("file", payload.file);

  const optionalFields: Record<string, number | string | null | undefined> = {
    report_id: payload.report_id,
    device_id: payload.device_id,
    zone_id: payload.zone_id,
    latitude: payload.latitude,
    longitude: payload.longitude,
    captured_at: payload.captured_at,
  };

  for (const [key, value] of Object.entries(optionalFields)) {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, String(value));
    }
  }

  return formData;
};

export const AI_SERVICE = {
  upload: async (
    payload: AiUploadPayload,
  ): Promise<ApiResponse<AiPredictionUploadResult>> =>
    api.post<ApiResponse<AiPredictionUploadResult>>("/ai/upload", {
      formData: buildUploadFormData(payload),
      timeoutMs: AI_TIMEOUT_MS,
    }),

  getPredictions: async (
    params?: AiPredictionListParams,
  ): Promise<ApiResponse<AiPrediction[]>> => {
    const result = await api.requestList<ApiResponse<AiPrediction[]>>(
      "GET",
      "/ai-predictions",
      { params, timeoutMs: 30_000 },
    );

    return {
      ...result.body,
      meta: result.meta ?? buildFallbackMeta(result.body.data.length),
    };
  },

  getPendingPredictions: async (): Promise<ApiResponse<AiPrediction[]>> =>
    api.get<ApiResponse<AiPrediction[]>>("/ai-predictions/pending-verification", {
      timeoutMs: 30_000,
    }),

  getPredictionById: async (
    id: number,
  ): Promise<ApiResponse<AiPrediction | null>> =>
    api.get<ApiResponse<AiPrediction | null>>(`/ai-predictions/${id}`, {
      timeoutMs: 30_000,
    }),

  verifyPrediction: async (
    id: number,
    payload: AiPredictionVerifyPayload,
  ): Promise<ApiResponse<AiPrediction>> =>
    api.post<ApiResponse<AiPrediction>>(`/ai-predictions/${id}/verify`, {
      body: payload,
      timeoutMs: 30_000,
    }),

  retryPrediction: async (
    id: number,
  ): Promise<ApiResponse<AiPrediction>> =>
    api.post<ApiResponse<AiPrediction>>(`/ai-predictions/${id}/retry`, {
      timeoutMs: AI_TIMEOUT_MS,
    }),

  deletePrediction: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/ai-predictions/${id}`),

  getMediaUploads: async (
    params?: AiMediaUploadListParams,
  ): Promise<ApiResponse<AiMediaUpload[]>> => {
    const result = await api.requestList<ApiResponse<AiMediaUpload[]>>(
      "GET",
      "/media-uploads",
      { params, timeoutMs: 30_000 },
    );

    return {
      ...result.body,
      meta: result.meta ?? buildFallbackMeta(result.body.data.length),
    };
  },

  getMediaUploadById: async (
    id: number,
  ): Promise<ApiResponse<AiMediaUpload | null>> =>
    api.get<ApiResponse<AiMediaUpload | null>>(`/media-uploads/${id}`, {
      timeoutMs: 30_000,
    }),

  getMediaFile: async (mediaId: number): Promise<BlobResponse> =>
    api.getBlob(`/media-uploads/${mediaId}/file`, { timeoutMs: AI_TIMEOUT_MS }),

  getMediaPredictions: async (
    mediaId: number,
  ): Promise<ApiResponse<AiPrediction[]>> =>
    api.get<ApiResponse<AiPrediction[]>>(
      `/media-uploads/${mediaId}/predictions`,
      { timeoutMs: 30_000 },
    ),

  triggerMediaPrediction: async (
    mediaId: number,
  ): Promise<ApiResponse<AiPrediction>> =>
    api.post<ApiResponse<AiPrediction>>(
      `/media-uploads/${mediaId}/predictions`,
      { timeoutMs: AI_TIMEOUT_MS },
    ),

  deleteMediaUpload: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/media-uploads/${id}`),

  getSummaryReport: async (
    params: AiSummaryReportParams,
  ): Promise<ApiResponse<AiSummaryReport>> => {
    const response = await api.get<ApiResponse<AiSummaryReport>>(
      "/ai/summary-report",
      { params, timeoutMs: AI_TIMEOUT_MS },
    );

    const data = unwrapData(response);

    return {
      ...response,
      data: {
        ...data,
        success:
          typeof data.success === "boolean" ? data.success : response.success,
      },
    };
  },

  getRecap: async (
    params: AiSummaryReportParams,
  ): Promise<ApiResponse<AiRecap>> =>
    api.get<ApiResponse<AiRecap>>("/ai/recap", {
      params,
      timeoutMs: AI_TIMEOUT_MS,
    }),

  getHealth: async (): Promise<ApiResponse<AiHealth>> =>
    api.get<ApiResponse<AiHealth>>("/ai/health", { timeoutMs: 30_000 }),

  getThreats: async (
    params?: AiThreatListParams,
  ): Promise<ApiResponse<AiPrediction[]>> => {
    const result = await api.requestList<ApiResponse<AiPrediction[]>>(
      "GET",
      "/ai/threats",
      { params, timeoutMs: 30_000 },
    );

    return {
      ...result.body,
      meta: result.meta ?? buildFallbackMeta(result.body.data.length),
    };
  },

  getVocabulary: async (): Promise<ApiResponse<AiVocabulary>> =>
    api.get<ApiResponse<AiVocabulary>>("/ai/vocabulary", {
      timeoutMs: 30_000,
    }),

  detectObjects: async (
    file: File,
  ): Promise<ApiResponse<AiDetectObjectsResult>> => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<ApiResponse<AiDetectObjectsResult>>(
      "/ai/detect-objects",
      { formData, timeoutMs: AI_TIMEOUT_MS },
    );
  },

  getStaffFaces: async (): Promise<ApiResponse<StaffFaceGroup[]>> =>
    api.get<ApiResponse<StaffFaceGroup[]>>("/staff-faces", { timeoutMs: 30_000 }),

  addStaffFace: async (file: File, name: string): Promise<ApiResponse<StaffFace>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    return api.post<ApiResponse<StaffFace>>("/staff-faces", {
      formData,
      timeoutMs: AI_TIMEOUT_MS,
    });
  },

  deleteStaffFace: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/staff-faces/${id}`),

  deleteStaffFacesByName: async (
    name: string,
  ): Promise<ApiResponse<{ deleted: number }>> =>
    api.delete<ApiResponse<{ deleted: number }>>("/staff-faces", {
      body: { name },
    }),

  getStaffFaceFile: async (id: number): Promise<BlobResponse> =>
    api.getBlob(`/staff-faces/${id}/file`, { timeoutMs: 30_000 }),

  getReferencePhotos: async (
    animalId: number,
  ): Promise<ApiResponse<AnimalReferencePhoto[]>> =>
    api.get<ApiResponse<AnimalReferencePhoto[]>>(
      `/animals/${animalId}/reference-photos`,
      { timeoutMs: 30_000 },
    ),

  addReferencePhoto: async (
    animalId: number,
    file: File,
  ): Promise<ApiResponse<AnimalReferencePhoto>> => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<ApiResponse<AnimalReferencePhoto>>(
      `/animals/${animalId}/reference-photos`,
      { formData, timeoutMs: AI_TIMEOUT_MS },
    );
  },

  deleteReferencePhoto: async (
    animalId: number,
    embeddingId: number,
  ): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(
      `/animals/${animalId}/reference-photos/${embeddingId}`,
    ),

  getReferencePhotoFile: async (
    animalId: number,
    embeddingId: number,
  ): Promise<BlobResponse> =>
    api.getBlob(`/animals/${animalId}/reference-photos/${embeddingId}/file`, {
      timeoutMs: 30_000,
    }),

  getAnimalObservations: async (
    animalId: number,
  ): Promise<ApiResponse<AiPrediction[]>> =>
    api.get<ApiResponse<AiPrediction[]>>(`/animals/${animalId}/ai-observations`, {
      timeoutMs: 30_000,
    }),
} as const;
