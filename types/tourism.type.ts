/** Modul wisata TNGL: rute tur, pemandu, shift, tarif PNBP, pemesanan, pembayaran, tiket, ulasan. */

export type TYPE_DIFFICULTY = "mudah" | "sedang" | "sulit";
export type TYPE_SHIFT_TYPE = "pagi" | "siang" | "malam";
export type TYPE_VISITOR_TYPE = "wni" | "wna" | "pelajar";
export type TYPE_DAY_TYPE = "weekday" | "holiday";

export type TYPE_BOOKING_STATUS =
  | "pending_payment"
  | "awaiting_verification"
  | "paid"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "expired";

export type TYPE_PAYMENT_METHOD = "bank_transfer" | "qris" | "ewallet" | "gateway" | "cash" | "edc";

export type TYPE_PAYMENT_STATUS =
  | "pending"
  | "awaiting_verification"
  | "paid"
  | "rejected"
  | "expired"
  | "refunded";

export type TYPE_ITINERARY_ITEM = { time: string; title: string; description?: string | null };

export type TYPE_EMERGENCY_CONTACT = {
  name: string;
  role: string;
  phone: string;
  radio_channel?: string | null;
  available: string;
  location: string;
  notes?: string | null;
};

export type TYPE_TRAIL_POST = {
  code: string;
  name: string;
  elevation_m: number;
  distance_km: number;
  water_source: string;
  signal: string;
  capacity: string;
  facilities: string[];
  notes?: string | null;
};

export type TYPE_AI_TRAIL_ALERT = {
  prediction_id: number;
  threat_level: "none" | "low" | "medium" | "high" | "critical";
  label: string;
  confidence: number | null;
  summary: string;
  detected_at: string | null;
};

export type TYPE_ROUTE_SAFETY = {
  route_id: number;
  slug: string;
  name: string;
  trail_status: "aman" | "waspada" | "darurat";
  porter_fee_per_day: number;
  emergency_contacts: TYPE_EMERGENCY_CONTACT[];
  post_details: TYPE_TRAIL_POST[];
  ai_emergencies: TYPE_AI_TRAIL_ALERT[];
};

export type TYPE_EMERGENCY_ALERT_PAYLOAD = {
  pos_code: string;
  emergency_type: "cedera" | "tersesat" | "satwa_agresif" | "cuaca_ekstrem" | "kebakaran" | "lainnya";
  description: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type TYPE_EMERGENCY_ALERT_RESPONSE = {
  alert_code: string;
  route: string;
  pos_code: string;
  emergency_type: string;
  trail_status: "darurat";
  notified_rangers: number;
  nearest_contact: TYPE_EMERGENCY_CONTACT | null;
  sent_at: string;
};

export type TYPE_TOUR_ROUTE = {
  route_id: number;
  code: string;
  slug: string;
  name: string;
  entry_point: string;
  summary: string;
  description: string;
  difficulty: TYPE_DIFFICULTY;
  duration_hours: number;
  duration_days: number;
  distance_km: number | string | null;
  max_group_size: number;
  min_age: number;
  meeting_point: string;
  meeting_lat: number | string | null;
  meeting_lon: number | string | null;
  start_time: string;
  guide_fee_per_person: number;
  porter_fee_per_day?: number;
  itinerary: TYPE_ITINERARY_ITEM[];
  includes: string[];
  bring_list: string[];
  rules: string[];
  wildlife: string[];
  waypoints: [number, number, number][] | null;
  emergency_contacts?: TYPE_EMERGENCY_CONTACT[] | null;
  post_details?: TYPE_TRAIL_POST[] | null;
  zone_id: number | null;
  is_active: boolean;
  reviews_avg_route_rating?: number | string | null;
  reviews_count?: number;
};

export type TYPE_TOUR_ROUTE_PAYLOAD = Omit<
  TYPE_TOUR_ROUTE,
  "route_id" | "slug" | "reviews_avg_route_rating" | "reviews_count" | "waypoints"
> & { waypoints?: [number, number, number][] | null };

export type TYPE_TOUR_GUIDE = {
  guide_id: number;
  display_name: string;
  bio: string;
  languages: string[];
  specialties: string[];
  favorite_animal: string;
  favorite_animal_reason: string | null;
  years_experience: number;
  certification: string | null;
  fun_fact: string | null;
  is_active: boolean;
  has_photo: boolean;
  reviews_avg_guide_rating?: number | string | null;
  reviews_count?: number;
};

export type TYPE_TOUR_GUIDE_PAYLOAD = Omit<
  TYPE_TOUR_GUIDE,
  "guide_id" | "has_photo" | "reviews_avg_guide_rating" | "reviews_count"
>;

/** Shift publik (sudah diringkas server, termasuk sisa kuota). */
export type TYPE_PUBLIC_SHIFT = {
  shift_id: number;
  shift_date: string;
  shift_type: TYPE_SHIFT_TYPE;
  start_time: string;
  end_time: string;
  capacity: number;
  remaining: number;
  guide: Pick<TYPE_TOUR_GUIDE, "guide_id" | "display_name" | "favorite_animal" | "languages" | "has_photo"> | null;
  route: Pick<TYPE_TOUR_ROUTE, "route_id" | "slug" | "name" | "entry_point"> | null;
};

/** Shift versi admin (baris tabel guide_shifts + remaining). */
export type TYPE_GUIDE_SHIFT = {
  shift_id: number;
  guide_id: number;
  route_id: number;
  shift_date: string;
  shift_type: TYPE_SHIFT_TYPE;
  start_time: string;
  end_time: string;
  capacity: number;
  status: "scheduled" | "cancelled";
  remaining?: number;
  guide?: Pick<TYPE_TOUR_GUIDE, "guide_id" | "display_name"> | null;
  route?: Pick<TYPE_TOUR_ROUTE, "route_id" | "name"> | null;
};

export type TYPE_GUIDE_SHIFT_PAYLOAD = {
  guide_id: number;
  route_id: number;
  shift_date: string;
  shift_type: TYPE_SHIFT_TYPE;
  start_time: string;
  end_time: string;
  capacity: number;
  status?: "scheduled" | "cancelled";
};

export type TYPE_PUBLIC_REVIEW = {
  review_id: number;
  reviewer: string;
  route_rating: number;
  guide_rating: number | null;
  guide: string | null;
  comment: string | null;
  created_at: string | null;
};

export type TYPE_ROUTE_DETAIL = {
  route: TYPE_TOUR_ROUTE;
  upcoming_shifts: TYPE_PUBLIC_SHIFT[];
  reviews: TYPE_PUBLIC_REVIEW[];
};

export type TYPE_GUIDE_DETAIL = {
  guide: TYPE_TOUR_GUIDE;
  upcoming_shifts: TYPE_PUBLIC_SHIFT[];
};

export type TYPE_TICKET_PRICE = {
  price_id: number;
  code: string;
  name: string;
  category: "entry" | "activity";
  visitor_type: TYPE_VISITOR_TYPE | "any";
  day_type: TYPE_DAY_TYPE | "any";
  unit: string;
  amount: number;
  min_quantity: number;
  legal_basis: string | null;
  is_active: boolean;
};

export type TYPE_PUBLIC_HOLIDAY = { holiday_id: number; holiday_date: string; name: string };

export type TYPE_QUOTE_LINE = {
  code: string;
  label: string;
  quantity: number;
  unit_price: number;
  days: number;
  subtotal: number;
};

export type TYPE_QUOTE = { day_type: TYPE_DAY_TYPE; lines: TYPE_QUOTE_LINE[]; total: number };

export type TYPE_QUOTE_PAYLOAD = {
  route_id: number;
  visit_date: string;
  wni_count: number;
  wna_count: number;
  student_count: number;
  drone_count: number;
  porter_count?: number;
};

export type TYPE_PAYMENT_INFO = {
  bank_transfer: { bank_name: string | null; account_number: string | null; account_holder: string | null };
  qris_merchant_name: string | null;
  payment_window_minutes: number;
  gateway_enabled: boolean;
  midtrans_enabled?: boolean;
  simulator_enabled?: boolean;
};

export type TYPE_SIMULATE_PAYMENT_CHANNEL =
  | "qris"
  | "va_bca"
  | "va_bni"
  | "va_bri"
  | "va_mandiri"
  | "gopay"
  | "ovo"
  | "dana"
  | "shopeepay";

export type TYPE_SIMULATE_PAYMENT_PAYLOAD = {
  channel: TYPE_SIMULATE_PAYMENT_CHANNEL;
  outcome?: "paid" | "failed";
};

export type TYPE_SIMULATE_PAYMENT_RESPONSE = {
  booking: TYPE_BOOKING;
  simulation: {
    channel: TYPE_SIMULATE_PAYMENT_CHANNEL;
    outcome: "paid" | "failed";
    transaction_id: string | null;
    verified_automatically: boolean;
  };
};

export type TYPE_PARTICIPANT = {
  participant_id?: number;
  full_name: string;
  visitor_type: TYPE_VISITOR_TYPE;
  age?: number | null;
};

export type TYPE_PAYMENT = {
  payment_id: number;
  booking_id: number;
  reference: string;
  method: TYPE_PAYMENT_METHOD;
  amount: number;
  received_amount?: number | null;
  change_amount?: number | null;
  external_reference?: string | null;
  status: TYPE_PAYMENT_STATUS;
  has_proof: boolean;
  paid_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  verifier?: { user_id: number; full_name: string } | null;
  booking?: {
    booking_id: number;
    booking_code: string;
    contact_name: string;
    visit_date: string;
    status: TYPE_BOOKING_STATUS;
    total_amount: number;
  } | null;
};

export type TYPE_TOUR_REVIEW = {
  review_id: number;
  booking_id: number;
  route_id: number;
  guide_id: number | null;
  route_rating: number;
  guide_rating: number | null;
  comment: string | null;
  is_visible: boolean;
  created_at: string;
  route?: { route_id: number; name: string } | null;
  guide?: { guide_id: number; display_name: string } | null;
  user?: { user_id: number; full_name: string } | null;
};

export type TYPE_BOOKING = {
  booking_id: number;
  booking_code: string;
  channel?: "online" | "pos";
  pos_session_id?: number | null;
  sold_by?: number | null;
  seller?: { user_id: number; full_name: string } | null;
  pos_session?: { session_id: number; counter_name: string } | null;
  route_id: number;
  shift_id: number;
  visit_date: string;
  day_type: TYPE_DAY_TYPE;
  wni_count: number;
  wna_count: number;
  porter_count?: number;
  student_count: number;
  drone_count: number;
  participant_count: number;
  price_lines: TYPE_QUOTE_LINE[];
  total_amount: number;
  status: TYPE_BOOKING_STATUS;
  contact_name: string;
  contact_phone: string;
  emergency_contact: string;
  notes: string | null;
  expires_at: string | null;
  checked_in_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  payment_window_seconds_left?: number | null;
  route?: Partial<TYPE_TOUR_ROUTE> | null;
  shift?: (TYPE_GUIDE_SHIFT & { guide?: Partial<TYPE_TOUR_GUIDE> | null }) | null;
  user?: { user_id: number; full_name: string; email: string; phone?: string | null } | null;
  participants?: TYPE_PARTICIPANT[];
  payments?: TYPE_PAYMENT[];
  review?: TYPE_TOUR_REVIEW | null;
};

export type TYPE_BOOKING_PAYLOAD = {
  route_id: number;
  shift_id: number;
  wni_count: number;
  wna_count: number;
  porter_count?: number;
  student_count: number;
  drone_count: number;
  contact_name: string;
  contact_phone: string;
  emergency_contact: string;
  notes?: string;
  payment_method: "bank_transfer" | "qris" | "ewallet";
  participants: TYPE_PARTICIPANT[];
};

export type TYPE_TICKET = {
  booking_code: string;
  qr_payload: string;
  status: TYPE_BOOKING_STATUS;
  visit_date: string;
  route: string | null;
  meeting_point: string | null;
  start_time: string;
  guide: string | null;
  participants: Pick<TYPE_PARTICIPANT, "full_name" | "visitor_type">[];
  checked_in_at: string | null;
};

export type TYPE_REVIEW_PAYLOAD = { route_rating: number; guide_rating?: number | null; comment?: string };

export type TYPE_SCHEDULE_PARAMS = { from?: string; to?: string; route_id?: number; guide_id?: number };
export type TYPE_ADMIN_BOOKING_PARAMS = { status?: string; visit_date?: string; search?: string };

export const BOOKING_STATUS_LABELS: Record<TYPE_BOOKING_STATUS, string> = {
  pending_payment: "Menunggu Pembayaran",
  awaiting_verification: "Menunggu Verifikasi",
  paid: "Lunas · Tiket Terbit",
  checked_in: "Sudah Check-in",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
};

export const PAYMENT_STATUS_LABELS: Record<TYPE_PAYMENT_STATUS, string> = {
  pending: "Belum Dibayar",
  awaiting_verification: "Menunggu Verifikasi",
  paid: "Diterima",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
  refunded: "Dikembalikan",
};

export const PAYMENT_METHOD_LABELS: Record<TYPE_PAYMENT_METHOD, string> = {
  bank_transfer: "Transfer Bank",
  qris: "QRIS",
  ewallet: "E-Wallet",
  gateway: "Payment Gateway",
  cash: "Tunai",
  edc: "Kartu (EDC)",
};

export const DIFFICULTY_LABELS: Record<TYPE_DIFFICULTY, string> = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Menantang",
};

export const SHIFT_LABELS: Record<TYPE_SHIFT_TYPE, string> = {
  pagi: "Shift Pagi",
  siang: "Shift Siang",
  malam: "Shift Malam",
};

export const VISITOR_TYPE_LABELS: Record<TYPE_VISITOR_TYPE, string> = {
  wni: "WNI",
  wna: "WNA",
  pelajar: "Pelajar/Mahasiswa",
};
