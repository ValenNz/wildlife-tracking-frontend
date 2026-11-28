"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AI_SERVICE } from "@/services/ai.service";
import type { ApiResponse } from "@/types/api.type";
import type {
  AiMediaUploadListParams,
  AiPredictionListParams,
  AiPredictionVerifyPayload,
  AiSummaryReport,
  AiSummaryReportParams,
  AiThreatListParams,
  AiUploadPayload,
} from "@/types/ai.type";

const AI_PREDICTIONS_KEY = ["ai-predictions"] as const;
const AI_MEDIA_KEY = ["ai-media-uploads"] as const;

export const useAiPredictions = (params?: AiPredictionListParams) =>
  useQuery({
    queryKey: [...AI_PREDICTIONS_KEY, params],
    queryFn: () => AI_SERVICE.getPredictions(params),
  });

export const useAiPendingPredictions = () =>
  useQuery({
    queryKey: [...AI_PREDICTIONS_KEY, "pending-verification"],
    queryFn: () => AI_SERVICE.getPendingPredictions(),
  });

const isProcessing = (status?: string) =>
  status === "queued" || status === "processing";

export const useAiPrediction = (id: number) =>
  useQuery({
    queryKey: [...AI_PREDICTIONS_KEY, id],
    queryFn: () => AI_SERVICE.getPredictionById(id),
    enabled: Number.isFinite(id) && id > 0,
    refetchInterval: (query) =>
      isProcessing(query.state.data?.data?.processing_status) ? 2000 : false,
  });

export const useAiThreats = (params?: AiThreatListParams) =>
  useQuery({
    queryKey: [...AI_PREDICTIONS_KEY, "threats", params],
    queryFn: () => AI_SERVICE.getThreats(params),
  });

export const useAiMediaUploads = (params?: AiMediaUploadListParams) =>
  useQuery({
    queryKey: [...AI_MEDIA_KEY, params],
    queryFn: () => AI_SERVICE.getMediaUploads(params),
  });

export const useAiMediaUpload = (id: number) =>
  useQuery({
    queryKey: [...AI_MEDIA_KEY, id],
    queryFn: () => AI_SERVICE.getMediaUploadById(id),
    enabled: Number.isFinite(id) && id > 0,
  });

export const useAiMediaFile = (mediaId: number) =>
  useQuery({
    queryKey: ["ai-media-files", mediaId],
    queryFn: () => AI_SERVICE.getMediaFile(mediaId),
    enabled: Number.isFinite(mediaId) && mediaId > 0,
  });

export const useAiMediaPredictions = (mediaId: number) =>
  useQuery({
    queryKey: [...AI_MEDIA_KEY, mediaId, "predictions"],
    queryFn: () => AI_SERVICE.getMediaPredictions(mediaId),
    enabled: Number.isFinite(mediaId) && mediaId > 0,
  });

export const useAiHealth = () =>
  useQuery({
    queryKey: ["ai-health"],
    queryFn: () => AI_SERVICE.getHealth(),
  });

export const useAiVocabulary = () =>
  useQuery({
    queryKey: ["ai-vocabulary"],
    queryFn: () => AI_SERVICE.getVocabulary(),
  });

export const useAiRecap = (params: AiSummaryReportParams) =>
  useQuery({
    queryKey: ["ai-recap", params],
    queryFn: () => AI_SERVICE.getRecap(params),
  });

export const useAiPredictionUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AiUploadPayload) => AI_SERVICE.upload(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: AI_PREDICTIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: AI_MEDIA_KEY }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
      ]);
    },
  });
};

export const useAiPredictionVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AiPredictionVerifyPayload }) =>
      AI_SERVICE.verifyPrediction(id, payload),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: AI_PREDICTIONS_KEY }),
        queryClient.invalidateQueries({
          queryKey: [...AI_PREDICTIONS_KEY, variables.id],
        }),
      ]);
    },
  });
};

export const useAiPredictionRetry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AI_SERVICE.retryPrediction(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AI_PREDICTIONS_KEY });
    },
  });
};

export const useAiTriggerMediaPrediction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: number) => AI_SERVICE.triggerMediaPrediction(mediaId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: AI_PREDICTIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: AI_MEDIA_KEY }),
      ]);
    },
  });
};

export const useAiDeletePrediction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AI_SERVICE.deletePrediction(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AI_PREDICTIONS_KEY });
    },
  });
};

export const useAiDeleteMediaUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AI_SERVICE.deleteMediaUpload(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: AI_MEDIA_KEY }),
        queryClient.invalidateQueries({ queryKey: AI_PREDICTIONS_KEY }),
      ]);
    },
  });
};

export const useAiDetectObjects = () =>
  useMutation({
    mutationFn: (file: File) => AI_SERVICE.detectObjects(file),
  });

export const useAiSummaryReport = () =>
  useMutation<ApiResponse<AiSummaryReport>, unknown, AiSummaryReportParams>({
    mutationFn: (params) => AI_SERVICE.getSummaryReport(params),
  });

const STAFF_FACES_KEY = ["staff-faces"] as const;

export const useStaffFaces = () =>
  useQuery({
    queryKey: STAFF_FACES_KEY,
    queryFn: () => AI_SERVICE.getStaffFaces(),
  });

export const useStaffFaceFile = (id: number) =>
  useQuery({
    queryKey: [...STAFF_FACES_KEY, "file", id],
    queryFn: () => AI_SERVICE.getStaffFaceFile(id),
    enabled: id > 0,
    staleTime: Infinity,
  });

export const useStaffFaceCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, name }: { file: File; name: string }) =>
      AI_SERVICE.addStaffFace(file, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: STAFF_FACES_KEY });
    },
  });
};

export const useStaffFaceDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AI_SERVICE.deleteStaffFace(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: STAFF_FACES_KEY });
    },
  });
};

export const useStaffFaceDeleteByName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => AI_SERVICE.deleteStaffFacesByName(name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: STAFF_FACES_KEY });
    },
  });
};

const referencePhotosKey = (animalId: number) =>
  ["animal-reference-photos", animalId] as const;

export const useAnimalReferencePhotos = (animalId: number) =>
  useQuery({
    queryKey: referencePhotosKey(animalId),
    queryFn: () => AI_SERVICE.getReferencePhotos(animalId),
    enabled: animalId > 0,
  });

export const useAnimalReferencePhotoFile = (animalId: number, embeddingId: number) =>
  useQuery({
    queryKey: [...referencePhotosKey(animalId), "file", embeddingId],
    queryFn: () => AI_SERVICE.getReferencePhotoFile(animalId, embeddingId),
    staleTime: Infinity,
    retry: false,
  });

export const useAnimalReferencePhotoCreate = (animalId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => AI_SERVICE.addReferencePhoto(animalId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: referencePhotosKey(animalId) });
    },
  });
};

export const useAnimalReferencePhotoDelete = (animalId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (embeddingId: number) =>
      AI_SERVICE.deleteReferencePhoto(animalId, embeddingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: referencePhotosKey(animalId) });
    },
  });
};

export const useAnimalAiObservations = (animalId: number) =>
  useQuery({
    queryKey: [...AI_PREDICTIONS_KEY, "animal", animalId],
    queryFn: () => AI_SERVICE.getAnimalObservations(animalId),
    enabled: animalId > 0,
  });
