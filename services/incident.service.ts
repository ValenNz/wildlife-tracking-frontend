import { api, unwrapData } from "@/services/api";

import type { AiMediaUpload } from "@/types/ai.type";
import type { ApiResponse } from "@/types/api.type";
import type {
  ApiIncidentReport,
  CreateIncidentReportPayload,
  IncidentReport,
  IncidentReportListParams,
  IncidentSyncStatus,
  UpdateIncidentReportPayload,
} from "@/types/incident.type";

const mapSyncStatus = (value: string | undefined): IncidentSyncStatus => {
  if (value === "synced") return "synced";
  if (value === "failed") return "failed";
  return "pending_sync";
};

const mapIncidentFromApi = (report: ApiIncidentReport): IncidentReport => ({
  report_id: report.report_id,
  user_id: report.user_id ?? report.reported_by ?? null,
  reported_by: report.reported_by ?? report.user_id ?? null,
  incident_type: report.incident_type,
  description: report.description,
  timestamp: report.timestamp,
  latitude: report.latitude,
  longitude: report.longitude,
  location: report.location ?? null,
  animal_id: report.animal_id ?? null,
  species_id: report.species_id ?? null,
  zone_id: report.zone_id ?? null,
  photo_url: report.photo_url ?? null,
  status: report.status ?? "pending",
  sync_status: mapSyncStatus(report.sync_status),
  source: report.source ?? "manual",
  animal_code:
    report.animal?.name_animal ??
    report.animal?.name ??
    report.animal?.animal_code ??
    null,
  reporter: report.reporter ?? null,
  animal: report.animal ?? null,
  species: report.species ?? null,
  zone: report.zone ?? null,
  media: report.media ?? [],
  created_at: report.created_at ?? null,
  updated_at: report.updated_at ?? null,
});

const toApiParams = (params?: IncidentReportListParams) => {
  if (!params) return undefined;

  const {
    incidentType,
    syncStatus,
    ...rest
  } = params;

  return {
    ...rest,
    incident_type: params.incident_type ?? incidentType,
    sync_status: params.sync_status ?? syncStatus,
  };
};

export const getIncidentReports = async (
  params?: IncidentReportListParams,
): Promise<ApiResponse<IncidentReport[]>> => {
  const result = await api.requestList<ApiResponse<ApiIncidentReport[]>>(
    "GET",
    "/incidents",
    { params: toApiParams(params) },
  );

  return {
    success: result.body.success,
    message: result.body.message ?? "OK",
    data: unwrapData(result.body).map(mapIncidentFromApi),
    errors: result.body.errors,
    meta: result.meta,
  };
};

export const getIncidentReportById = async (
  id: number,
): Promise<ApiResponse<IncidentReport | null>> => {
  const response = await api.get<ApiResponse<ApiIncidentReport>>(
    `/incidents/${id}`,
  );

  const report = unwrapData(response);

  return {
    success: true,
    message: response.message ?? "OK",
    data: report ? mapIncidentFromApi(report) : null,
  };
};

export const createIncidentReport = async (
  payload: CreateIncidentReportPayload,
): Promise<ApiResponse<IncidentReport>> => {
  const response = await api.post<ApiResponse<ApiIncidentReport>>("/incidents", {
    body: payload,
  });

  return {
    success: true,
    message: response.message ?? "Laporan insiden berhasil dibuat.",
    data: mapIncidentFromApi(unwrapData(response)),
  };
};

export const updateIncidentReport = async (
  id: number,
  payload: UpdateIncidentReportPayload,
): Promise<ApiResponse<IncidentReport>> => {
  const response = await api.put<ApiResponse<ApiIncidentReport>>(
    `/incidents/${id}`,
    { body: payload },
  );

  return {
    success: true,
    message: response.message ?? "Laporan insiden diperbarui.",
    data: mapIncidentFromApi(unwrapData(response)),
  };
};

export const updateIncidentSyncStatus = async (
  id: number,
  sync_status: IncidentSyncStatus,
): Promise<ApiResponse<IncidentReport>> => {
  const response = await api.patch<ApiResponse<ApiIncidentReport>>(
    `/incidents/${id}/sync-status`,
    { body: { sync_status } },
  );

  return {
    success: true,
    message: response.message,
    data: mapIncidentFromApi(unwrapData(response)),
  };
};

export const deleteIncidentReport = async (
  id: number,
): Promise<ApiResponse<null>> =>
  api.delete<ApiResponse<null>>(`/incidents/${id}`);

export const getIncidentMedia = async (
  id: number,
): Promise<AiMediaUpload[]> => {
  const response = await api.get<ApiResponse<AiMediaUpload[]>>(
    `/incidents/${id}/media`,
  );

  return unwrapData(response) ?? [];
};

export const uploadIncidentMedia = async (
  id: number,
  file: File,
  analyze = false,
): Promise<unknown> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("analyze", analyze ? "1" : "0");

  const response = await api.post<ApiResponse<unknown>>(
    `/incidents/${id}/media`,
    { formData, timeoutMs: 120_000 },
  );

  return unwrapData(response);
};

export const getPendingSyncReports = async (): Promise<
  ApiResponse<IncidentReport[]>
> =>
  getIncidentReports({ sync_status: "pending_sync" });
