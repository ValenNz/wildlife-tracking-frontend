"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { POS_SERVICE } from "@/services/pos.service";
import type { TYPE_POS_SALE_PAYLOAD } from "@/types/pos.type";

const POS_KEY = ["pos"] as const;

const useInvalidatePos = () => {
  const queryClient = useQueryClient();
  // Penjualan loket juga mengubah sisa kuota di jadwal wisata.
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: POS_KEY }),
      queryClient.invalidateQueries({ queryKey: ["tourism"] }),
    ]);
};

export const usePosSession = () =>
  useQuery({ queryKey: [...POS_KEY, "session"], queryFn: POS_SERVICE.GET_SESSION, select: (response) => response.data });

export const usePosSales = (enabled: boolean) =>
  useQuery({ queryKey: [...POS_KEY, "sales"], queryFn: POS_SERVICE.GET_SALES, select: (response) => response.data, enabled });

export const usePosSessions = (date?: string) =>
  useQuery({
    queryKey: [...POS_KEY, "sessions", date],
    queryFn: () => POS_SERVICE.GET_SESSIONS({ date: date || undefined }),
    select: (response) => response.data,
  });

export const usePosSessionReport = (id: number) =>
  useQuery({
    queryKey: [...POS_KEY, "session-report", id],
    queryFn: () => POS_SERVICE.GET_SESSION_REPORT(id),
    select: (response) => response.data,
    enabled: id > 0,
  });

export const usePosDailyReport = (date: string) =>
  useQuery({
    queryKey: [...POS_KEY, "daily", date],
    queryFn: () => POS_SERVICE.GET_DAILY_REPORT(date),
    select: (response) => response.data,
  });

export const usePosOpenSession = () => {
  const invalidate = useInvalidatePos();
  return useMutation({ mutationFn: POS_SERVICE.OPEN_SESSION, onSuccess: invalidate });
};

export const usePosCloseSession = () => {
  const invalidate = useInvalidatePos();
  return useMutation({ mutationFn: POS_SERVICE.CLOSE_SESSION, onSuccess: invalidate });
};

export const usePosSell = () => {
  const invalidate = useInvalidatePos();
  return useMutation({ mutationFn: (payload: TYPE_POS_SALE_PAYLOAD) => POS_SERVICE.SELL(payload), onSuccess: invalidate });
};

export const usePosVoid = () => {
  const invalidate = useInvalidatePos();
  return useMutation({
    mutationFn: ({ code, reason }: { code: string; reason: string }) => POS_SERVICE.VOID(code, reason),
    onSuccess: invalidate,
  });
};
