import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { SESSION_MAX_AGE_SECONDS, TOKEN_COOKIE } from "@/lib/cookie-names";
import type { UserRole } from "@/types/user";

const FALLBACK_BASE_URL = "http://localhost:8000/api";
const USER_ROLES: UserRole[] = [
  "konservasionis_lapangan",
  "peneliti_ekologi",
  "administrator_sistem",
  "pengambil_kebijakan",
];

export const dynamic = "force-dynamic";

const getBaseUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  const base = configured && configured.length > 0 ? configured : FALLBACK_BASE_URL;

  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && USER_ROLES.includes(value as UserRole);

const readString = (record: Record<string, unknown>, key: string): string => {
  const value = record[key];

  return typeof value === "string" ? value : "";
};

const readNumber = (record: Record<string, unknown>, key: string): number => {
  const value = record[key];

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const fail = (
  status: number,
  message: string,
  errors?: Record<string, string[]> | null,
) => NextResponse.json({ success: false, message, errors: errors ?? null }, { status });

export const POST = async (request: Request): Promise<NextResponse> => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return fail(400, "Format permintaan tidak valid.");
  }

  if (typeof payload !== "object" || payload === null) {
    return fail(400, "Format permintaan tidak valid.");
  }

  const body = payload as Record<string, unknown>;
  const username = readString(body, "username").trim();
  const password = readString(body, "password");

  if (username.length === 0 || password.length === 0) {
    return fail(422, "Username dan kata sandi wajib diisi.", {
      username: username.length === 0 ? ["Username wajib diisi"] : [],
      password: password.length === 0 ? ["Kata sandi wajib diisi"] : [],
    });
  }

  let response: Response;

  try {
    response = await fetch(`${getBaseUrl()}/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    return fail(
      503,
      "Tidak dapat menghubungi API backend. Pastikan server Laravel berjalan di port 8000.",
    );
  }

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (typeof data !== "object" || data === null) {
    return fail(502, "Format respons login tidak dikenali.");
  }

  const record = data as Record<string, unknown>;
  const errors =
    typeof record.errors === "object" && record.errors !== null
      ? (record.errors as Record<string, string[]>)
      : null;

  if (!response.ok) {
    const status = response.status === 422 ? 401 : response.status;

    return fail(
      status,
      typeof record.message === "string"
        ? record.message
        : "Autentikasi gagal.",
      errors,
    );
  }

  const envelope = record.data;

  const credentials =
    typeof envelope === "object" && envelope !== null
      ? (envelope as Record<string, unknown>)
      : record;

  const userRecord =
    typeof credentials.user === "object" && credentials.user !== null
      ? (credentials.user as Record<string, unknown>)
      : null;

  const token = readString(credentials, "token");

  if (token.length === 0 || userRecord === null || !isUserRole(userRecord.role)) {
    return fail(502, "Respons login tidak memuat token dan pengguna dengan role yang valid.");
  }

  const sessionUser = {
    user_id: readNumber(userRecord, "user_id"),
    username: readString(userRecord, "username"),
    name: readString(userRecord, "full_name"),
    email: readString(userRecord, "email"),
    role: userRecord.role,
  };

  const cookieStore = await cookies();
  const isSecure = process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE, JSON.stringify(sessionUser), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json(
    { success: true, message: "Login berhasil.", data: { user: sessionUser } },
    { status: 200 },
  );
};