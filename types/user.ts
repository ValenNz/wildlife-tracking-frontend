export type UserRole =
  | "konservasionis_lapangan"
  | "peneliti_ekologi"
  | "administrator_sistem"
  | "pengambil_kebijakan";

export type User = {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string | null;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  konservasionis_lapangan: "Konservasionis",
  peneliti_ekologi: "Peneliti",
  administrator_sistem: "Administrator",
  pengambil_kebijakan: "Pengambil Kebijakan",
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResult = {
  token: string;
  expires_at: string;
  type: string;
};

export type LoginResponseData = {
  token: string;
  user: User;
};