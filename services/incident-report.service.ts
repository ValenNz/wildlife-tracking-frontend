import { api } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type {
  IncidentReport,
  IncidentReportListParams,
} from "@/types/incident-report";

const filterReports = (
  reports: IncidentReport[],
  params?: IncidentReportListParams,
): IncidentReport[] =>
  reports.filter((report) => {
    const matchesType =
      params?.incidentType === undefined ||
      report.incident_type === params.incidentType;

    const matchesSync =
      params?.syncStatus === undefined || report.sync_status === params.syncStatus;

    return matchesType && matchesSync;
  });

export const getIncidentReports = async (
  params?: Partial<QUERY_PARAMS_API_GET_ALL> & IncidentReportListParams,
): Promise<ApiResponse<IncidentReport[]>> => {
  const response = await api.get<IncidentReport[]>(
    `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.INCIDENTS.GET_ALL(params)}`,
  );

  const reports = Array.isArray(response) ? (response as IncidentReport[]) : [];

  return {
    success: true,
    message: "OK",
    data: filterReports(reports, params).sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    ),
  };
};

export const getPendingSyncReports = async (): Promise<ApiResponse<IncidentReport[]>> => {
  const response = await getIncidentReports();
  const reports = response.data ?? [];
  return {
    success: true,
    message: "OK",
    data: reports.filter((report) => report.sync_status !== "synced"),
  };
};