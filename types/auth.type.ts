import { TYPE_META_PAGGINATION } from "@/types/meta.type";

export type TYPE_USER_ROLE =
  | "konservasionis_lapangan"
  | "peneliti_ekologi"
  | "administrator_sistem"
  | "pengambil_kebijakan"
  | "petugas_loket"
  | "pengunjung";

export const USER_ROLES = [
  "konservasionis_lapangan",
  "peneliti_ekologi",
  "administrator_sistem",
  "pengambil_kebijakan",
  "petugas_loket",
  "pengunjung",
] as const satisfies readonly TYPE_USER_ROLE[];

export const normalizeUserRole = (value: unknown): TYPE_USER_ROLE | null => {
  if (typeof value !== "string") return null;

  const candidate = value.trim();

  return USER_ROLES.includes(candidate as TYPE_USER_ROLE)
    ? (candidate as TYPE_USER_ROLE)
    : null;
};

export type AppPermission =
  | "view_data"
  | "create_data"
  | "update_data"
  | "delete_data"
  | "manage_users"
  | "manage_roles"
  | "view_reports"
  | "manage_master_data"
  | "upload_media"
  | "verify_ai"
  | "export_data"
  | "book_tickets"
  | "manage_tourism"
  | "validate_tickets"
  | "sell_tickets";

export const ROLE_PERMISSIONS: Record<TYPE_USER_ROLE, AppPermission[]> = {
  konservasionis_lapangan: [
    "view_data",
    "create_data",
    "update_data",
    "upload_media",
    "verify_ai",
    "validate_tickets",
  ],
  peneliti_ekologi: [
    "view_data",
    "create_data",
    "update_data",
    "view_reports",
    "manage_master_data",
    "upload_media",
    "verify_ai",
    "export_data",
  ],
  administrator_sistem: [
    "view_data",
    "create_data",
    "update_data",
    "delete_data",
    "manage_users",
    "manage_roles",
    "view_reports",
    "manage_master_data",
    "upload_media",
    "verify_ai",
    "export_data",
    "book_tickets",
    "manage_tourism",
    "validate_tickets",
    "sell_tickets",
  ],
  pengambil_kebijakan: [
    "view_data",
    "view_reports",
    "upload_media",
    "export_data",
  ],
  petugas_loket: ["sell_tickets", "validate_tickets"],
  pengunjung: ["book_tickets"],
};

export const roleHasPermission = (
  role: TYPE_USER_ROLE,
  permission: AppPermission,
): boolean => ROLE_PERMISSIONS[role].includes(permission);

export type TYPE_USER = {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  role: TYPE_USER_ROLE;
  created_at: string;
};

export type TYPE_USER_PAYLOAD = {
  username: string;
  full_name: string;
  email: string;
  password: string;
  role: TYPE_USER_ROLE;
};

export type TYPE_USER_GET_ALL_RESPONSE = {
  items: TYPE_USER[];
  meta: TYPE_META_PAGGINATION;
};

export type TYPE_USER_GET_BY_ID_RESPONSE = {
  items: TYPE_USER;
  meta: null;
};

export const TYPE_ROLE_LABELS: Record<TYPE_USER_ROLE, string> = {
  konservasionis_lapangan: "Konservasionis Lapangan",
  peneliti_ekologi: "Peneliti Ekologi",
  administrator_sistem: "Administrator Sistem",
  pengambil_kebijakan: "Pengambil Kebijakan",
  petugas_loket: "Petugas Loket",
  pengunjung: "Pengunjung",
};

export type TYPE_REGISTER_REQUEST = {
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  captcha_token: string;
  captcha_answer: string;
  /** Honeypot: selalu kosong untuk manusia. */
  website?: string;
};

export type TYPE_REGISTER_CHALLENGE = { challenge_token: string; question: string; expires_in: number } | null;

export type TYPE_LOGIN_PAYLOAD = {
  username: string;
  password: string;
};

export type TYPE_LOGIN_REQUEST = {
  email: string;
  password: string;
};

export type TYPE_LOGIN_SESSION_USER = {
  user_id: number;
  username: string;
  name: string;
  email: string;
  role: TYPE_USER_ROLE;
  permissions: AppPermission[];
};

export type LoginAttempt =
  | {
      ok: true;
      status: number;
      message: string;
      errors: null;
      user: TYPE_LOGIN_SESSION_USER;
    }
  | {
      ok: false;
      status: number;
      message: string;
      errors: Record<string, string[]> | null;
      user: null;
    };

export type LaravelAuthResult =
  | { ok: true; user: TYPE_LOGIN_SESSION_USER; token: string }
  | {
      ok: false;
      status: number;
      message: string;
      errors: Record<string, string[]> | null;
    };

export type LaravelCurrentUserResult =
  | { ok: true; user: TYPE_LOGIN_SESSION_USER }
  | {
      ok: false;
      status: number;
      message: string;
    };

export type VerifiedSessionResult =
  | { ok: true; user: TYPE_LOGIN_SESSION_USER }
  | {
      ok: false;
      reason: "missing_session" | "expired" | "invalid_user" | "backend";
      status: number;
      message: string;
    };

export type TYPE_LOGIN_RESULT = {
  token: string;
  expires_at: string;
  type: string;
};

export type TYPE_LOGIN_RESPONSE_DATA = {
  token: string;
  user: TYPE_USER;
};

export type TYPE_BACKEND_ROLE = {
  role_id: number;
  role_name: string;
  description?: string | null;
  created_at?: string | null;
};

export type TYPE_BACKEND_LOGIN_USER = {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  status: string;
  role: TYPE_BACKEND_ROLE | null;
};

export type TYPE_BACKEND_LOGIN_DATA = {
  user: TYPE_BACKEND_LOGIN_USER;
  token: string;
};

export type TYPE_BACKEND_LOGIN_RESPONSE = {
  success: boolean;
  message: string;
  data: TYPE_BACKEND_LOGIN_DATA;
  errors?: Record<string, string[]> | null;
};

export type TYPE_BACKEND_ME_USER = Omit<TYPE_BACKEND_LOGIN_USER, "role"> & {
  role: TYPE_BACKEND_ROLE | null;
  permissions?: unknown;
};

export type TYPE_BACKEND_ME_RESPONSE = {
  success: boolean;
  message: string;
  data: TYPE_BACKEND_ME_USER;
  errors?: Record<string, string[]> | null;
};
