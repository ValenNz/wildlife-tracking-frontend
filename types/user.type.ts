import type { TYPE_META_PAGGINATION } from "@/types/meta.type";

export type TYPE_USER_STATUS = "aktif" | "nonaktif";

export type TYPE_USER_ACCOUNT = {
  user_id: number;
  role_id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: TYPE_USER_STATUS;
  created_at: string | null;
  role?: { role_id: number; name_role: string } | null;
};

export type TYPE_USER_ACCOUNT_PAYLOAD = {
  username: string;
  full_name: string;
  email: string;
  role_id: number;
  password?: string;
  phone?: string | null;
  address?: string | null;
};

export type TYPE_USER_ACCOUNT_PARAMS = {
  search?: string;
  status?: TYPE_USER_STATUS;
  role_id?: number;
};

export type TYPE_USER_ACCOUNT_GET_ALL_RESPONSE = {
  items: TYPE_USER_ACCOUNT[];
  meta: TYPE_META_PAGGINATION;
};

export type TYPE_USER_TOKEN = {
  id: number;
  name: string;
  last_used_at: string | null;
  created_at: string;
};

export type TYPE_PROFILE = TYPE_USER_ACCOUNT & {
  name_role: string | null;
  permissions: string[];
};

export type TYPE_PROFILE_PAYLOAD = {
  full_name?: string;
  username?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
};

export type TYPE_PASSWORD_PAYLOAD = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export const TYPE_USER_STATUS_LABELS: Record<TYPE_USER_STATUS, string> = {
  aktif: "Aktif",
  nonaktif: "Nonaktif",
};
