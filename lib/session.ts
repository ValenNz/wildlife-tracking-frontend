import { cookies } from "next/headers";
import type { TYPE_USER_ROLE } from "@/types/user.type";

export const SESSION_COOKIE = "wms_session";

export type SessionUser = {
  user_id: number;
  name: string;
  email: string;
  role: TYPE_USER_ROLE;
};

const USER_ROLES: TYPE_USER_ROLE[] = [
  "konservasionis_lapangan",
  "peneliti_ekologi",
  "administrator_sistem",
  "pengambil_kebijakan",
];

const isUserRole = (value: unknown): value is TYPE_USER_ROLE =>
  typeof value === "string" && USER_ROLES.includes(value as TYPE_USER_ROLE);

const readString = (record: Record<string, unknown>, key: string): string => {
  const value = record[key];

  return typeof value === "string" ? value : "";
};

const readNumber = (record: Record<string, unknown>, key: string): number => {
  const value = record[key];

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

export const getSessionUser = async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) return null;

    const record = parsed as Record<string, unknown>;

    if (!isUserRole(record.role)) return null;

    return {
      user_id: readNumber(record, "user_id"),
      name: readString(record, "name"),
      email: readString(record, "email"),
      role: record.role,
    };
  } catch {
    return null;
  }
};