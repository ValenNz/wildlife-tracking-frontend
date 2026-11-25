import { api } from "@/services/api";

import type { ApiResponse, BlobResponse } from "@/types/api.type";
import type {
  TYPE_ADMIN_BOOKING_PARAMS,
  TYPE_BOOKING,
  TYPE_BOOKING_PAYLOAD,
  TYPE_EMERGENCY_ALERT_PAYLOAD,
  TYPE_EMERGENCY_ALERT_RESPONSE,
  TYPE_GUIDE_DETAIL,
  TYPE_GUIDE_SHIFT,
  TYPE_GUIDE_SHIFT_PAYLOAD,
  TYPE_PAYMENT,
  TYPE_PAYMENT_INFO,
  TYPE_PUBLIC_HOLIDAY,
  TYPE_PUBLIC_SHIFT,
  TYPE_QUOTE,
  TYPE_QUOTE_PAYLOAD,
  TYPE_REVIEW_PAYLOAD,
  TYPE_ROUTE_DETAIL,
  TYPE_ROUTE_SAFETY,
  TYPE_SCHEDULE_PARAMS,
  TYPE_SIMULATE_PAYMENT_PAYLOAD,
  TYPE_SIMULATE_PAYMENT_RESPONSE,
  TYPE_TICKET,
  TYPE_TICKET_PRICE,
  TYPE_TOUR_GUIDE,
  TYPE_TOUR_GUIDE_PAYLOAD,
  TYPE_TOUR_REVIEW,
  TYPE_TOUR_ROUTE,
  TYPE_TOUR_ROUTE_PAYLOAD,
} from "@/types/tourism.type";

const enc = encodeURIComponent;

/** Katalog publik (rute, pemandu, jadwal, tarif, simulasi harga). */
export const TOURISM_CATALOG_SERVICE = {
  GET_ROUTES: async (): Promise<ApiResponse<TYPE_TOUR_ROUTE[]>> =>
    api.get<ApiResponse<TYPE_TOUR_ROUTE[]>>("/tourism/routes"),

  GET_ROUTE: async (slug: string): Promise<ApiResponse<TYPE_ROUTE_DETAIL>> =>
    api.get<ApiResponse<TYPE_ROUTE_DETAIL>>(`/tourism/routes/${enc(slug)}`),

  GET_ROUTE_SAFETY: async (slug: string): Promise<ApiResponse<TYPE_ROUTE_SAFETY>> =>
    api.get<ApiResponse<TYPE_ROUTE_SAFETY>>(`/tourism/routes/${enc(slug)}/safety`),

  SEND_EMERGENCY_ALERT: async (
    slug: string,
    payload: TYPE_EMERGENCY_ALERT_PAYLOAD,
  ): Promise<ApiResponse<TYPE_EMERGENCY_ALERT_RESPONSE>> =>
    api.post<ApiResponse<TYPE_EMERGENCY_ALERT_RESPONSE>>(`/tourism/routes/${enc(slug)}/emergency-alert`, {
      body: payload,
    }),

  GET_GUIDES: async (): Promise<ApiResponse<TYPE_TOUR_GUIDE[]>> =>
    api.get<ApiResponse<TYPE_TOUR_GUIDE[]>>("/tourism/guides"),

  GET_GUIDE: async (id: number): Promise<ApiResponse<TYPE_GUIDE_DETAIL>> =>
    api.get<ApiResponse<TYPE_GUIDE_DETAIL>>(`/tourism/guides/${id}`),

  GET_GUIDE_PHOTO: async (id: number): Promise<BlobResponse> =>
    api.getBlob(`/tourism/guides/${id}/photo`),

  GET_SCHEDULE: async (params?: TYPE_SCHEDULE_PARAMS): Promise<ApiResponse<TYPE_PUBLIC_SHIFT[]>> =>
    api.get<ApiResponse<TYPE_PUBLIC_SHIFT[]>>("/tourism/schedule", { params }),

  GET_PRICES: async (): Promise<ApiResponse<TYPE_TICKET_PRICE[]>> =>
    api.get<ApiResponse<TYPE_TICKET_PRICE[]>>("/tourism/prices"),

  QUOTE: async (payload: TYPE_QUOTE_PAYLOAD): Promise<ApiResponse<TYPE_QUOTE>> =>
    api.post<ApiResponse<TYPE_QUOTE>>("/tourism/quote", { body: payload }),

  GET_PAYMENT_INFO: async (): Promise<ApiResponse<TYPE_PAYMENT_INFO>> =>
    api.get<ApiResponse<TYPE_PAYMENT_INFO>>("/tourism/payment-info"),
} as const;

/** Pemesanan milik pengunjung yang login (izin book_tickets). */
export const VISITOR_BOOKING_SERVICE = {
  GET_ALL: async (): Promise<ApiResponse<TYPE_BOOKING[]>> =>
    api.get<ApiResponse<TYPE_BOOKING[]>>("/visitor/bookings"),

  GET_BY_CODE: async (code: string): Promise<ApiResponse<TYPE_BOOKING>> =>
    api.get<ApiResponse<TYPE_BOOKING>>(`/visitor/bookings/${enc(code)}`),

  CREATE: async (payload: TYPE_BOOKING_PAYLOAD): Promise<ApiResponse<TYPE_BOOKING>> =>
    api.post<ApiResponse<TYPE_BOOKING>>("/visitor/bookings", { body: payload }),

  CANCEL: async (code: string): Promise<ApiResponse<TYPE_BOOKING>> =>
    api.post<ApiResponse<TYPE_BOOKING>>(`/visitor/bookings/${enc(code)}/cancel`),

  UPLOAD_PROOF: async (code: string, file: File): Promise<ApiResponse<TYPE_BOOKING>> => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<ApiResponse<TYPE_BOOKING>>(`/visitor/bookings/${enc(code)}/payment-proof`, {
      formData,
      timeoutMs: 60_000,
    });
  },

  /** Buat transaksi Midtrans Snap; kembalikan URL halaman pembayaran Midtrans. */
  PAY_ONLINE: async (code: string): Promise<ApiResponse<{ redirect_url: string; reference: string }>> =>
    api.post<ApiResponse<{ redirect_url: string; reference: string }>>(`/visitor/bookings/${enc(code)}/pay-online`, { timeoutMs: 30_000 }),

  /** Simulasi pembayaran gateway gratis (QRIS / VA / E-Wallet) dengan verifikasi otomatis. */
  SIMULATE_PAYMENT: async (
    code: string,
    payload: TYPE_SIMULATE_PAYMENT_PAYLOAD,
  ): Promise<ApiResponse<TYPE_SIMULATE_PAYMENT_RESPONSE>> =>
    api.post<ApiResponse<TYPE_SIMULATE_PAYMENT_RESPONSE>>(`/visitor/bookings/${enc(code)}/simulate-payment`, {
      body: payload,
      timeoutMs: 20_000,
    }),

  GET_TICKET: async (code: string): Promise<ApiResponse<TYPE_TICKET>> =>
    api.get<ApiResponse<TYPE_TICKET>>(`/visitor/bookings/${enc(code)}/ticket`),

  REVIEW: async (code: string, payload: TYPE_REVIEW_PAYLOAD): Promise<ApiResponse<TYPE_TOUR_REVIEW>> =>
    api.post<ApiResponse<TYPE_TOUR_REVIEW>>(`/visitor/bookings/${enc(code)}/review`, { body: payload }),
} as const;

/** Pemeriksaan tiket di loket (izin validate_tickets). */
export const TICKET_CHECK_IN_SERVICE = {
  CHECK_IN: async (ticket: string): Promise<ApiResponse<TYPE_BOOKING>> =>
    api.post<ApiResponse<TYPE_BOOKING>>("/tourism/check-in", { body: { ticket } }),

  GET_TODAY: async (): Promise<ApiResponse<TYPE_BOOKING[]>> =>
    api.get<ApiResponse<TYPE_BOOKING[]>>("/tourism/check-in/today"),
} as const;

/** Pengelolaan wisata (izin manage_tourism). */
export const TOURISM_ADMIN_SERVICE = {
  GET_ROUTES: async (): Promise<ApiResponse<TYPE_TOUR_ROUTE[]>> =>
    api.get<ApiResponse<TYPE_TOUR_ROUTE[]>>("/tourism/admin/routes"),
  GET_ROUTE: async (id: number): Promise<ApiResponse<TYPE_TOUR_ROUTE>> =>
    api.get<ApiResponse<TYPE_TOUR_ROUTE>>(`/tourism/admin/routes/${id}`),
  CREATE_ROUTE: async (payload: TYPE_TOUR_ROUTE_PAYLOAD): Promise<ApiResponse<TYPE_TOUR_ROUTE>> =>
    api.post<ApiResponse<TYPE_TOUR_ROUTE>>("/tourism/admin/routes", { body: payload }),
  UPDATE_ROUTE: async (id: number, payload: Partial<TYPE_TOUR_ROUTE_PAYLOAD>): Promise<ApiResponse<TYPE_TOUR_ROUTE>> =>
    api.put<ApiResponse<TYPE_TOUR_ROUTE>>(`/tourism/admin/routes/${id}`, { body: payload }),
  DELETE_ROUTE: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/tourism/admin/routes/${id}`),

  GET_GUIDES: async (): Promise<ApiResponse<TYPE_TOUR_GUIDE[]>> =>
    api.get<ApiResponse<TYPE_TOUR_GUIDE[]>>("/tourism/admin/guides"),
  CREATE_GUIDE: async (payload: TYPE_TOUR_GUIDE_PAYLOAD): Promise<ApiResponse<TYPE_TOUR_GUIDE>> =>
    api.post<ApiResponse<TYPE_TOUR_GUIDE>>("/tourism/admin/guides", { body: payload }),
  UPDATE_GUIDE: async (id: number, payload: Partial<TYPE_TOUR_GUIDE_PAYLOAD>): Promise<ApiResponse<TYPE_TOUR_GUIDE>> =>
    api.put<ApiResponse<TYPE_TOUR_GUIDE>>(`/tourism/admin/guides/${id}`, { body: payload }),
  DELETE_GUIDE: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/tourism/admin/guides/${id}`),
  UPLOAD_GUIDE_PHOTO: async (id: number, file: File): Promise<ApiResponse<TYPE_TOUR_GUIDE>> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<TYPE_TOUR_GUIDE>>(`/tourism/admin/guides/${id}/photo`, { formData, timeoutMs: 60_000 });
  },

  GET_SHIFTS: async (params?: TYPE_SCHEDULE_PARAMS): Promise<ApiResponse<TYPE_GUIDE_SHIFT[]>> =>
    api.get<ApiResponse<TYPE_GUIDE_SHIFT[]>>("/tourism/admin/shifts", { params }),
  CREATE_SHIFT: async (payload: TYPE_GUIDE_SHIFT_PAYLOAD): Promise<ApiResponse<TYPE_GUIDE_SHIFT>> =>
    api.post<ApiResponse<TYPE_GUIDE_SHIFT>>("/tourism/admin/shifts", { body: payload }),
  UPDATE_SHIFT: async (id: number, payload: Partial<TYPE_GUIDE_SHIFT_PAYLOAD>): Promise<ApiResponse<TYPE_GUIDE_SHIFT>> =>
    api.put<ApiResponse<TYPE_GUIDE_SHIFT>>(`/tourism/admin/shifts/${id}`, { body: payload }),
  DELETE_SHIFT: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/tourism/admin/shifts/${id}`),

  GET_PRICES: async (): Promise<ApiResponse<TYPE_TICKET_PRICE[]>> =>
    api.get<ApiResponse<TYPE_TICKET_PRICE[]>>("/tourism/admin/prices"),
  UPDATE_PRICE: async (id: number, payload: Partial<TYPE_TICKET_PRICE>): Promise<ApiResponse<TYPE_TICKET_PRICE>> =>
    api.put<ApiResponse<TYPE_TICKET_PRICE>>(`/tourism/admin/prices/${id}`, { body: payload }),
  GET_HOLIDAYS: async (): Promise<ApiResponse<TYPE_PUBLIC_HOLIDAY[]>> =>
    api.get<ApiResponse<TYPE_PUBLIC_HOLIDAY[]>>("/tourism/admin/holidays"),
  CREATE_HOLIDAY: async (payload: { holiday_date: string; name: string }): Promise<ApiResponse<TYPE_PUBLIC_HOLIDAY>> =>
    api.post<ApiResponse<TYPE_PUBLIC_HOLIDAY>>("/tourism/admin/holidays", { body: payload }),
  DELETE_HOLIDAY: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/tourism/admin/holidays/${id}`),

  GET_BOOKINGS: async (params?: TYPE_ADMIN_BOOKING_PARAMS): Promise<ApiResponse<TYPE_BOOKING[]>> =>
    api.get<ApiResponse<TYPE_BOOKING[]>>("/tourism/admin/bookings", { params }),
  GET_BOOKING: async (code: string): Promise<ApiResponse<TYPE_BOOKING>> =>
    api.get<ApiResponse<TYPE_BOOKING>>(`/tourism/admin/bookings/${enc(code)}`),
  CANCEL_BOOKING: async (code: string): Promise<ApiResponse<TYPE_BOOKING>> =>
    api.post<ApiResponse<TYPE_BOOKING>>(`/tourism/admin/bookings/${enc(code)}/cancel`),

  GET_PAYMENTS: async (status?: string): Promise<ApiResponse<TYPE_PAYMENT[]>> =>
    api.get<ApiResponse<TYPE_PAYMENT[]>>("/tourism/admin/payments", { params: { status } }),
  GET_PAYMENT_PROOF: async (id: number): Promise<BlobResponse> =>
    api.getBlob(`/tourism/admin/payments/${id}/proof`),
  VERIFY_PAYMENT: async (id: number, approve: boolean, reason?: string): Promise<ApiResponse<TYPE_BOOKING>> =>
    api.post<ApiResponse<TYPE_BOOKING>>(`/tourism/admin/payments/${id}/verify`, {
      body: { approve, reason: reason || null },
    }),

  GET_REVIEWS: async (): Promise<ApiResponse<TYPE_TOUR_REVIEW[]>> =>
    api.get<ApiResponse<TYPE_TOUR_REVIEW[]>>("/tourism/admin/reviews"),
  SET_REVIEW_VISIBILITY: async (id: number, isVisible: boolean): Promise<ApiResponse<TYPE_TOUR_REVIEW>> =>
    api.patch<ApiResponse<TYPE_TOUR_REVIEW>>(`/tourism/admin/reviews/${id}`, { body: { is_visible: isVisible } }),
} as const;
