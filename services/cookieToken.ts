import { cookies } from "next/headers";
import {
  EXPIRES_AT_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  TOKEN_COOKIE,
  TYPE_COOKIE,
} from "@/lib/cookie-names";

const isLocalhost = (): boolean => (process.env.NEXT_PUBLIC_DOMAIN ?? "localhost") === "localhost";

const secureFlag = (): boolean => process.env.NODE_ENV === "production";

const writeCookie = async (
  name: string,
  value: string,
  expires?: Date,
): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureFlag(),
    path: "/",
    ...(expires === undefined ? {} : { expires }),
  });
};

const readCookie = async (name: string): Promise<string | null> => {
  const cookieStore = await cookies();

  return cookieStore.get(name)?.value ?? null;
};

const removeCookie = async (name: string): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.delete(name);
};

const decodeJwtExpiry = (token: string): number | null => {
  const segments = token.split(".");

  if (segments.length !== 3) return null;

  try {
    const normalized = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const json: unknown = JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));

    if (typeof json !== "object" || json === null || !("exp" in json)) return null;

    const exp = json.exp;

    return typeof exp === "number" && Number.isFinite(exp) ? exp : null;
  } catch {
    return null;
  }
};

export type TokenPayload = {
  token: string;
  expires_at: string;
  type: string;
};

export async function saveAuthCookies(payload: TokenPayload): Promise<void> {
  const expirySeconds = decodeJwtExpiry(payload.token);
  const expires =
    expirySeconds === null
      ? new Date(payload.expires_at)
      : new Date(expirySeconds * 1000);

  await writeCookie(TOKEN_COOKIE, payload.token, expires);
  await writeCookie(EXPIRES_AT_COOKIE, payload.expires_at, expires);
  await writeCookie(TYPE_COOKIE, payload.type, expires);
}

export async function getAuthToken(): Promise<string | null> {
  return readCookie(TOKEN_COOKIE);
}

export async function getExpiresAt(): Promise<string | null> {
  return readCookie(EXPIRES_AT_COOKIE);
}

export async function getTokenType(): Promise<string | null> {
  return readCookie(TYPE_COOKIE);
}

export async function isTokenLocalhost(): Promise<boolean> {
  return isLocalhost();
}

export async function clearAuthCookies(): Promise<void> {
  await removeCookie(TOKEN_COOKIE);
  await removeCookie(EXPIRES_AT_COOKIE);
  await removeCookie(TYPE_COOKIE);
}

export const AUTH_MAX_AGE = SESSION_MAX_AGE_SECONDS;