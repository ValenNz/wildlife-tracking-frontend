const FALLBACK_TOKEN_COOKIE = "wms_token";

const readCookieName = (
  value: string | undefined,
  fallback: string,
): string => {
  const trimmed = value?.trim();

  return trimmed === undefined || trimmed.length === 0 ? fallback : trimmed;
};

export const TOKEN_COOKIE = readCookieName(
  process.env.NEXT_PUBLIC_COOKIE_TOKEN,
  FALLBACK_TOKEN_COOKIE,
);

export const EXPIRES_AT_COOKIE = readCookieName(
  process.env.NEXT_PUBLIC_COOKIE_EXPIRES_AT,
  "wms_expires_at",
);

export const TYPE_COOKIE = readCookieName(
  process.env.NEXT_PUBLIC_COOKIE_TYPE,
  "wms_type",
);

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;