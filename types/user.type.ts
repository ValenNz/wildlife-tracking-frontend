import { TYPE_META_PAGGINATION } from "@/types/meta.type";

export type TYPE_USER_ROLE =
  | "konservasionis_lapangan"
  | "peneliti_ekologi"
  | "administrator_sistem"
  | "pengambil_kebijakan";

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
};

export type TYPE_LOGIN_PAYLOAD = {
  username: string;
  password: string;
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