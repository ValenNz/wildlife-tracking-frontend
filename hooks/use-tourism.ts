"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  TICKET_CHECK_IN_SERVICE,
  TOURISM_ADMIN_SERVICE,
  TOURISM_CATALOG_SERVICE,
  VISITOR_BOOKING_SERVICE,
} from "@/services/tourism.service";
import type {
  TYPE_ADMIN_BOOKING_PARAMS,
  TYPE_BOOKING_PAYLOAD,
  TYPE_EMERGENCY_ALERT_PAYLOAD,
  TYPE_GUIDE_SHIFT_PAYLOAD,
  TYPE_QUOTE_PAYLOAD,
  TYPE_REVIEW_PAYLOAD,
  TYPE_SCHEDULE_PARAMS,
  TYPE_SIMULATE_PAYMENT_PAYLOAD,
  TYPE_TICKET_PRICE,
  TYPE_TOUR_GUIDE_PAYLOAD,
  TYPE_TOUR_ROUTE_PAYLOAD,
} from "@/types/tourism.type";

const TOURISM_KEY = ["tourism"] as const;
const BOOKINGS_KEY = ["tourism", "bookings"] as const;

const useInvalidateTourism = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: TOURISM_KEY });
};

export const useTourRoutes = () =>
  useQuery({
    queryKey: [...TOURISM_KEY, "routes"],
    queryFn: TOURISM_CATALOG_SERVICE.GET_ROUTES,
    select: (response) => response.data,
  });

export const useTourRoute = (slug: string) =>
  useQuery({
    queryKey: [...TOURISM_KEY, "route", slug],
    queryFn: () => TOURISM_CATALOG_SERVICE.GET_ROUTE(slug),
    select: (response) => response.data,
    enabled: slug !== "",
  });

export const useRouteSafety = (slug: string) =>
  useQuery({
    queryKey: [...TOURISM_KEY, "route-safety", slug],
    queryFn: () => TOURISM_CATALOG_SERVICE.GET_ROUTE_SAFETY(slug),
    select: (response) => response.data,
    enabled: slug !== "",
  });

export const useSendEmergencyAlert = (slug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TYPE_EMERGENCY_ALERT_PAYLOAD) =>
      TOURISM_CATALOG_SERVICE.SEND_EMERGENCY_ALERT(slug, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...TOURISM_KEY, "route-safety", slug] });
    },
  });
};

export const useTourGuides = () =>
  useQuery({
    queryKey: [...TOURISM_KEY, "guides"],
    queryFn: TOURISM_CATALOG_SERVICE.GET_GUIDES,
    select: (response) => response.data,
  });

export const useTourGuide = (id: number) =>
  useQuery({
    queryKey: [...TOURISM_KEY, "guide", id],
    queryFn: () => TOURISM_CATALOG_SERVICE.GET_GUIDE(id),
    select: (response) => response.data,
    enabled: id > 0,
  });

export const useGuidePhoto = (id: number, hasPhoto: boolean) =>
  useQuery({
    queryKey: [...TOURISM_KEY, "guide-photo", id],
    queryFn: async () => URL.createObjectURL((await TOURISM_CATALOG_SERVICE.GET_GUIDE_PHOTO(id)).blob),
    enabled: hasPhoto && id > 0,
    staleTime: 60 * 60 * 1000,
  });

export const useTourSchedule = (params?: TYPE_SCHEDULE_PARAMS) =>
  useQuery({
    queryKey: [...TOURISM_KEY, "schedule", params],
    queryFn: () => TOURISM_CATALOG_SERVICE.GET_SCHEDULE(params),
    select: (response) => response.data,
  });

export const useTicketPrices = () =>
  useQuery({
    queryKey: [...TOURISM_KEY, "prices"],
    queryFn: TOURISM_CATALOG_SERVICE.GET_PRICES,
    select: (response) => response.data,
  });

export const usePaymentInfo = () =>
  useQuery({
    queryKey: [...TOURISM_KEY, "payment-info"],
    queryFn: TOURISM_CATALOG_SERVICE.GET_PAYMENT_INFO,
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });

export const useTourQuote = (payload: TYPE_QUOTE_PAYLOAD | null) =>
  useQuery({
    queryKey: [...TOURISM_KEY, "quote", payload],
    queryFn: () => TOURISM_CATALOG_SERVICE.QUOTE(payload as TYPE_QUOTE_PAYLOAD),
    select: (response) => response.data,
    enabled: payload !== null,
    retry: false,
  });

export const useMyBookings = () =>
  useQuery({
    queryKey: [...BOOKINGS_KEY, "mine"],
    queryFn: VISITOR_BOOKING_SERVICE.GET_ALL,
    select: (response) => response.data,
  });

export const useMyBooking = (code: string) =>
  useQuery({
    queryKey: [...BOOKINGS_KEY, "mine", code],
    queryFn: () => VISITOR_BOOKING_SERVICE.GET_BY_CODE(code),
    select: (response) => response.data,
    enabled: code !== "",
    refetchInterval: 30_000,
  });

export const useMyTicket = (code: string, enabled: boolean) =>
  useQuery({
    queryKey: [...BOOKINGS_KEY, "ticket", code],
    queryFn: () => VISITOR_BOOKING_SERVICE.GET_TICKET(code),
    select: (response) => response.data,
    enabled: enabled && code !== "",
  });

export const useBookingCreate = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: (payload: TYPE_BOOKING_PAYLOAD) => VISITOR_BOOKING_SERVICE.CREATE(payload),
    onSuccess: invalidate,
  });
};

export const useBookingCancel = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: (code: string) => VISITOR_BOOKING_SERVICE.CANCEL(code),
    onSuccess: invalidate,
  });
};

export const usePaymentProofUpload = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: ({ code, file }: { code: string; file: File }) => VISITOR_BOOKING_SERVICE.UPLOAD_PROOF(code, file),
    onSuccess: invalidate,
  });
};

export const usePayOnline = () =>
  useMutation({ mutationFn: (code: string) => VISITOR_BOOKING_SERVICE.PAY_ONLINE(code) });

export const useSimulatePayment = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: ({ code, payload }: { code: string; payload: TYPE_SIMULATE_PAYMENT_PAYLOAD }) =>
      VISITOR_BOOKING_SERVICE.SIMULATE_PAYMENT(code, payload),
    onSuccess: invalidate,
  });
};

export const useBookingReview = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: ({ code, payload }: { code: string; payload: TYPE_REVIEW_PAYLOAD }) =>
      VISITOR_BOOKING_SERVICE.REVIEW(code, payload),
    onSuccess: invalidate,
  });
};

export const useTodayVisits = () =>
  useQuery({
    queryKey: [...BOOKINGS_KEY, "today"],
    queryFn: TICKET_CHECK_IN_SERVICE.GET_TODAY,
    select: (response) => response.data,
    refetchInterval: 60_000,
  });

export const useTicketCheckIn = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: (ticket: string) => TICKET_CHECK_IN_SERVICE.CHECK_IN(ticket),
    onSuccess: invalidate,
  });
};

export const useAdminTourRoutes = () =>
  useQuery({
    queryKey: [...TOURISM_KEY, "admin", "routes"],
    queryFn: TOURISM_ADMIN_SERVICE.GET_ROUTES,
    select: (response) => response.data,
  });

export const useAdminTourRoute = (id: number) =>
  useQuery({
    queryKey: [...TOURISM_KEY, "admin", "route", id],
    queryFn: () => TOURISM_ADMIN_SERVICE.GET_ROUTE(id),
    select: (response) => response.data,
    enabled: id > 0,
  });

export const useTourRouteSave = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: TYPE_TOUR_ROUTE_PAYLOAD }) =>
      id ? TOURISM_ADMIN_SERVICE.UPDATE_ROUTE(id, payload) : TOURISM_ADMIN_SERVICE.CREATE_ROUTE(payload),
    onSuccess: invalidate,
  });
};

export const useTourRouteDelete = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({ mutationFn: TOURISM_ADMIN_SERVICE.DELETE_ROUTE, onSuccess: invalidate });
};

export const useAdminTourGuides = () =>
  useQuery({
    queryKey: [...TOURISM_KEY, "admin", "guides"],
    queryFn: TOURISM_ADMIN_SERVICE.GET_GUIDES,
    select: (response) => response.data,
  });

export const useTourGuideSave = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: TYPE_TOUR_GUIDE_PAYLOAD }) =>
      id ? TOURISM_ADMIN_SERVICE.UPDATE_GUIDE(id, payload) : TOURISM_ADMIN_SERVICE.CREATE_GUIDE(payload),
    onSuccess: invalidate,
  });
};

export const useTourGuideDelete = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({ mutationFn: TOURISM_ADMIN_SERVICE.DELETE_GUIDE, onSuccess: invalidate });
};

export const useGuidePhotoUpload = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => TOURISM_ADMIN_SERVICE.UPLOAD_GUIDE_PHOTO(id, file),
    onSuccess: invalidate,
  });
};

export const useAdminShifts = (params?: TYPE_SCHEDULE_PARAMS) =>
  useQuery({
    queryKey: [...TOURISM_KEY, "admin", "shifts", params],
    queryFn: () => TOURISM_ADMIN_SERVICE.GET_SHIFTS(params),
    select: (response) => response.data,
  });

export const useShiftSave = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: Partial<TYPE_GUIDE_SHIFT_PAYLOAD> }) =>
      id
        ? TOURISM_ADMIN_SERVICE.UPDATE_SHIFT(id, payload)
        : TOURISM_ADMIN_SERVICE.CREATE_SHIFT(payload as TYPE_GUIDE_SHIFT_PAYLOAD),
    onSuccess: invalidate,
  });
};

export const useShiftDelete = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({ mutationFn: TOURISM_ADMIN_SERVICE.DELETE_SHIFT, onSuccess: invalidate });
};

export const useAdminPrices = () =>
  useQuery({
    queryKey: [...TOURISM_KEY, "admin", "prices"],
    queryFn: TOURISM_ADMIN_SERVICE.GET_PRICES,
    select: (response) => response.data,
  });

export const usePriceUpdate = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TYPE_TICKET_PRICE> }) =>
      TOURISM_ADMIN_SERVICE.UPDATE_PRICE(id, payload),
    onSuccess: invalidate,
  });
};

export const useHolidays = () =>
  useQuery({
    queryKey: [...TOURISM_KEY, "admin", "holidays"],
    queryFn: TOURISM_ADMIN_SERVICE.GET_HOLIDAYS,
    select: (response) => response.data,
  });

export const useHolidayCreate = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({ mutationFn: TOURISM_ADMIN_SERVICE.CREATE_HOLIDAY, onSuccess: invalidate });
};

export const useHolidayDelete = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({ mutationFn: TOURISM_ADMIN_SERVICE.DELETE_HOLIDAY, onSuccess: invalidate });
};

export const useAdminBookings = (params?: TYPE_ADMIN_BOOKING_PARAMS) =>
  useQuery({
    queryKey: [...BOOKINGS_KEY, "admin", params],
    queryFn: () => TOURISM_ADMIN_SERVICE.GET_BOOKINGS(params),
    select: (response) => response.data,
  });

export const useAdminBooking = (code: string) =>
  useQuery({
    queryKey: [...BOOKINGS_KEY, "admin", "detail", code],
    queryFn: () => TOURISM_ADMIN_SERVICE.GET_BOOKING(code),
    select: (response) => response.data,
    enabled: code !== "",
  });

export const useAdminBookingCancel = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({ mutationFn: TOURISM_ADMIN_SERVICE.CANCEL_BOOKING, onSuccess: invalidate });
};

export const useAdminPayments = (status?: string) =>
  useQuery({
    queryKey: [...TOURISM_KEY, "admin", "payments", status],
    queryFn: () => TOURISM_ADMIN_SERVICE.GET_PAYMENTS(status),
    select: (response) => response.data,
  });

export const usePaymentVerify = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: ({ id, approve, reason }: { id: number; approve: boolean; reason?: string }) =>
      TOURISM_ADMIN_SERVICE.VERIFY_PAYMENT(id, approve, reason),
    onSuccess: invalidate,
  });
};

export const useAdminReviews = () =>
  useQuery({
    queryKey: [...TOURISM_KEY, "admin", "reviews"],
    queryFn: TOURISM_ADMIN_SERVICE.GET_REVIEWS,
    select: (response) => response.data,
  });

export const useReviewVisibility = () => {
  const invalidate = useInvalidateTourism();
  return useMutation({
    mutationFn: ({ id, isVisible }: { id: number; isVisible: boolean }) =>
      TOURISM_ADMIN_SERVICE.SET_REVIEW_VISIBILITY(id, isVisible),
    onSuccess: invalidate,
  });
};
