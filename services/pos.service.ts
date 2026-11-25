import { api } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type {
  TYPE_POS_DAILY_REPORT,
  TYPE_POS_SALE,
  TYPE_POS_SALE_PAYLOAD,
  TYPE_POS_SESSION,
} from "@/types/pos.type";

const enc = encodeURIComponent;

/** POS loket (izin sell_tickets; laporan harian butuh manage_tourism). */
export const POS_SERVICE = {
  GET_SESSION: async (): Promise<ApiResponse<TYPE_POS_SESSION | null>> =>
    api.get<ApiResponse<TYPE_POS_SESSION | null>>("/pos/session"),

  OPEN_SESSION: async (payload: { counter_name: string; opening_cash: number }): Promise<ApiResponse<TYPE_POS_SESSION>> =>
    api.post<ApiResponse<TYPE_POS_SESSION>>("/pos/session/open", { body: payload }),

  CLOSE_SESSION: async (payload: { counted_cash: number; note?: string }): Promise<ApiResponse<TYPE_POS_SESSION>> =>
    api.post<ApiResponse<TYPE_POS_SESSION>>("/pos/session/close", { body: payload }),

  GET_SESSIONS: async (params?: { date?: string }): Promise<ApiResponse<TYPE_POS_SESSION[]>> =>
    api.get<ApiResponse<TYPE_POS_SESSION[]>>("/pos/sessions", { params }),

  GET_SESSION_REPORT: async (id: number): Promise<ApiResponse<TYPE_POS_SESSION>> =>
    api.get<ApiResponse<TYPE_POS_SESSION>>(`/pos/sessions/${id}`),

  GET_SALES: async (): Promise<ApiResponse<TYPE_POS_SALE[]>> =>
    api.get<ApiResponse<TYPE_POS_SALE[]>>("/pos/sales"),

  SELL: async (payload: TYPE_POS_SALE_PAYLOAD): Promise<ApiResponse<TYPE_POS_SALE>> =>
    api.post<ApiResponse<TYPE_POS_SALE>>("/pos/sales", { body: payload }),

  GET_SALE: async (code: string): Promise<ApiResponse<TYPE_POS_SALE>> =>
    api.get<ApiResponse<TYPE_POS_SALE>>(`/pos/sales/${enc(code)}`),

  VOID: async (code: string, reason: string): Promise<ApiResponse<TYPE_POS_SALE>> =>
    api.post<ApiResponse<TYPE_POS_SALE>>(`/pos/sales/${enc(code)}/void`, { body: { reason } }),

  GET_DAILY_REPORT: async (date?: string): Promise<ApiResponse<TYPE_POS_DAILY_REPORT>> =>
    api.get<ApiResponse<TYPE_POS_DAILY_REPORT>>("/pos/report", { params: { date } }),
} as const;
