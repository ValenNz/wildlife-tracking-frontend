"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { EXPORT_SERVICE, REPORT_SERVICE } from "@/services/report.service";
import type { TYPE_AGGREGATE_REPORT_PAYLOAD } from "@/types/report.type";

const REPORTS_KEY = ["aggregate-reports"] as const;

export const useAggregateReports = () =>
  useQuery({ queryKey: REPORTS_KEY, queryFn: () => REPORT_SERVICE.GET_ALL() });

export const useAggregateReportGenerate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_AGGREGATE_REPORT_PAYLOAD) => REPORT_SERVICE.GENERATE(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: REPORTS_KEY });
    },
  });
};

export const useAggregateReportDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => REPORT_SERVICE.DELETE(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: REPORTS_KEY });
    },
  });
};

export const useAggregateReportDownload = () =>
  useMutation({ mutationFn: (id: number) => REPORT_SERVICE.DOWNLOAD(id) });

export const useExportDownload = () =>
  useMutation({
    mutationFn: ({
      path,
      params,
    }: {
      path: string;
      params?: { start_date?: string; end_date?: string };
    }) => EXPORT_SERVICE.DOWNLOAD(path, params),
  });
