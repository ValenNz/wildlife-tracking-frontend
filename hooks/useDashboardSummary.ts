"use client";

import { useCallback } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import {
  getDashboardSummary,
  EMPTY_DASHBOARD_SUMMARY,
} from "@/services/dashboard.service";
import type { AsyncResource } from "@/hooks/useAsyncResource";
import type { DashboardSummary } from "@/types/dashboard";

const isEmptySummary = (summary: DashboardSummary): boolean =>
  summary.totalAnimals === 0 &&
  summary.totalSpecies === 0 &&
  summary.totalDevices === 0;

export const useDashboardSummary = (): AsyncResource<DashboardSummary> => {
  const load = useCallback(() => getDashboardSummary(), []);

  return useAsyncResource(load, EMPTY_DASHBOARD_SUMMARY, isEmptySummary);
};