import { StatusBadge, type BadgeVariant } from "@/components/status";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type TYPE_BOOKING_STATUS,
  type TYPE_PAYMENT_STATUS,
} from "@/types/tourism.type";

const BOOKING_VARIANTS: Record<TYPE_BOOKING_STATUS, BadgeVariant> = {
  pending_payment: "warning",
  awaiting_verification: "info",
  paid: "success",
  checked_in: "success",
  completed: "neutral",
  cancelled: "danger",
  expired: "neutral",
};

const PAYMENT_VARIANTS: Record<TYPE_PAYMENT_STATUS, BadgeVariant> = {
  pending: "warning",
  awaiting_verification: "info",
  paid: "success",
  rejected: "danger",
  expired: "neutral",
  refunded: "neutral",
};

export function BookingStatusBadge({ status }: { status: TYPE_BOOKING_STATUS }) {
  return <StatusBadge label={BOOKING_STATUS_LABELS[status] ?? status} variant={BOOKING_VARIANTS[status] ?? "neutral"} />;
}

export function PaymentStatusBadge({ status }: { status: TYPE_PAYMENT_STATUS }) {
  return <StatusBadge label={PAYMENT_STATUS_LABELS[status] ?? status} variant={PAYMENT_VARIANTS[status] ?? "neutral"} />;
}
