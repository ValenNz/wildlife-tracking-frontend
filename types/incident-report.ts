export type IncidentSyncStatus = "pending_sync" | "synced" | "failed";

export type IncidentReport = {
  report_id: number;
  user_id: number | null;
  incident_type: string;
  animal_code: string | null;
  location: string;
  description: string;
  timestamp: string;
  photo_url: string | null;
  sync_status: IncidentSyncStatus;
};

export type IncidentReportListParams = {
  incidentType?: string;
  syncStatus?: IncidentSyncStatus;
};