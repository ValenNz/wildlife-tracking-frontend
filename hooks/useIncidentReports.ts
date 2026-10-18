"use client";

import { useCallback } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { getIncidentReports } from "@/services/incident-report.service";
import type { AsyncResource } from "@/hooks/useAsyncResource";
import type {
  IncidentReport,
  IncidentReportListParams,
} from "@/types/incident-report";

const EMPTY_REPORTS: IncidentReport[] = [];

export const useIncidentReports = (
  params?: IncidentReportListParams,
): AsyncResource<IncidentReport[]> => {
  const { incidentType, syncStatus } = params ?? {};

  const load = useCallback(
    () => getIncidentReports({ incidentType, syncStatus }),
    [incidentType, syncStatus],
  );

  return useAsyncResource(
    load,
    EMPTY_REPORTS,
    (reports) => reports.length === 0,
  );
};