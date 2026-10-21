"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/services/dashboard.service";
import type { DashboardSummary } from "@/types/dashboard";
import type { ApiResponse } from "@/types/api.type";

export const useDashboardSummary = () => {
  return useQuery<ApiResponse<DashboardSummary>>({
    queryKey: ["dashboard-summary"],
    queryFn: () => getDashboardSummary(),
  });
};