import { api, unwrapData } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.type";
import type {
  IncidentReport,
  IncidentReportListParams,
} from "@/types/incident-report";

const BASE = "/api/wildlife";

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
  params?: IncidentReportListParams,
): Promise<IncidentReport[]> => {
  const response = await api.get<ApiResponse<IncidentReport[]>>(
    `${BASE}/incidents`,
  );
  const payload = unwrapData(response);
  const reports = Array.isArray(payload) ? (payload as IncidentReport[]) : [];

  return filterReports(reports, params).sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
};

export const getPendingSyncReports = async (): Promise<IncidentReport[]> => {
  const reports = await getIncidentReports();

  return reports.filter((report) => report.sync_status !== "synced");
};