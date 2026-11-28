import {
  ApiError,
  createServerApiClient,
  getLaravelApiBaseUrl,
} from "@/services/api";
import {
  normalizeUserRole,
  ROLE_PERMISSIONS,
} from "@/types/auth.type";
import type {
  AppPermission,
  LaravelAuthResult,
  LaravelCurrentUserResult,
  TYPE_LOGIN_REQUEST,
  TYPE_LOGIN_SESSION_USER,
  TYPE_REGISTER_REQUEST,
} from "@/types/auth.type";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;

const readString = (record: Record<string, unknown>, key: string): string => {
  const value = record[key];

  return typeof value === "string" ? value.trim() : "";
};

const readNumber = (record: Record<string, unknown>, key: string): number => {
  const value = record[key];

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const failure = (
  status: number,
  message: string,
  errors: Record<string, string[]> | null = null,
): Extract<LaravelAuthResult, { ok: false }> => ({
  ok: false,
  status,
  message,
  errors,
});

const readRoleName = (value: unknown): string | null => {
  const role = asRecord(value);

  if (role === null) return null;

  return readString(role, "role_name") || readString(role, "name_role") || null;
};

const readPermissions = (
  value: unknown,
  role: TYPE_LOGIN_SESSION_USER["role"],
): AppPermission[] => {
  const allowed = new Set(ROLE_PERMISSIONS[role]);
  const values = Array.isArray(value) ? value : [];

  const permissions = values
    .map((item) => {
      if (typeof item === "string") return item;
      const record = asRecord(item);
      return record
        ? readString(record, "permission_name") || readString(record, "name_permission")
        : "";
    })
    .filter((item): item is AppPermission => allowed.has(item as AppPermission));

  return [...new Set(permissions)];
};

const toSessionUser = (
  record: Record<string, unknown>,
): TYPE_LOGIN_SESSION_USER | null => {
  const roleName = readRoleName(record.role);

  if (roleName === null) return null;

  const role = normalizeUserRole(roleName);

  if (role === null) return null;

  const user_id = readNumber(record, "user_id");
  const username = readString(record, "username");
  const name = readString(record, "full_name");
  const email = readString(record, "email");
  const roleRecord = asRecord(record.role);
  const permissions = readPermissions(
    record.permissions ?? roleRecord?.permissions,
    role,
  );

  if (user_id <= 0 || username === "" || name === "" || email === "") {
    return null;
  }

  return { user_id, username, name, email, role, permissions };
};

export const getCurrentUserFromLaravel = async (
  token: string,
): Promise<LaravelCurrentUserResult> => {
  const serverApi = createServerApiClient(getLaravelApiBaseUrl());

  try {
    const response: unknown = await serverApi.get("/me", { token });
    const envelope = asRecord(response);

    if (envelope === null || envelope.success !== true) {
      return {
        ok: false,
        status: 502,
        message: "Format data pengguna tidak dikenali.",
      };
    }

    const user = toSessionUser(asRecord(envelope.data) ?? {});

    if (user === null) {
      return {
        ok: false,
        status: 502,
        message: "Data pengguna tidak memuat identitas dan role yang valid.",
      };
    }

    return { ok: true, user };
  } catch (error) {
    if (error instanceof ApiError) {
      const status = error.status === 0 ? 503 : error.status;

      return {
        ok: false,
        status,
        message:
          error.status === 0
            ? "Tidak dapat menghubungi API backend. Pastikan server Laravel berjalan."
            : error.message,
      };
    }

    return {
      ok: false,
      status: 503,
      message:
        "Tidak dapat menghubungi API backend. Pastikan server Laravel berjalan.",
    };
  }
};

export const authenticateWithLaravel = async (
  payload: TYPE_LOGIN_REQUEST,
  headers: Record<string, string> = {},
): Promise<LaravelAuthResult> =>
  requestAuthToken("/login", { email: payload.email, password: payload.password }, headers);

export const registerWithLaravel = async (
  payload: TYPE_REGISTER_REQUEST,
  headers: Record<string, string> = {},
): Promise<LaravelAuthResult> =>
  requestAuthToken(
    "/register",
    {
    full_name: payload.full_name,
    username: payload.username,
    email: payload.email,
    phone: payload.phone || null,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
    captcha_token: payload.captcha_token,
    captcha_answer: payload.captcha_answer,
    website: payload.website ?? "",
  },
    headers,
  );

const requestAuthToken = async (
  path: "/login" | "/register",
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Promise<LaravelAuthResult> => {
  const serverApi = createServerApiClient(getLaravelApiBaseUrl());

  try {
    const response: unknown = await serverApi.post(path, { body, headers });

    const envelope = asRecord(response);

    if (envelope === null) {
      return failure(502, "Format respons login tidak dikenali.");
    }

    if (envelope.success !== true) {
      return failure(502, "Backend tidak mengonfirmasi keberhasilan login.");
    }

    const data = asRecord(envelope.data);

    if (data === null) {
      return failure(502, "Respons login tidak memuat data autentikasi.");
    }

    const token = readString(data, "token");

    if (token === "") {
      return failure(502, "Respons login tidak memuat token autentikasi.");
    }

    const userRecord = asRecord(data.user);

    if (userRecord === null) {
      return failure(502, "Respons login tidak memuat data pengguna.");
    }

    const roleName = readRoleName(userRecord.role);

    if (roleName === null) {
      return failure(403, "Pengguna tidak memiliki role yang ditetapkan.");
    }

    if (normalizeUserRole(roleName) === null) {
      return failure(403, `Role "${roleName}" tidak didukung oleh aplikasi.`);
    }

    const user = toSessionUser(userRecord);

    if (user === null) {
      return failure(502, "Respons login tidak memuat identitas pengguna yang valid.");
    }

    return {
      ok: true,
      token,
      user,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const status = error.status === 0 ? 503 : error.status;

      return failure(
        status,
        error.status === 0
          ? "Tidak dapat menghubungi API backend. Pastikan server Laravel berjalan."
          : error.message,
        error.errors,
      );
    }

    return failure(
      503,
      "Tidak dapat menghubungi API backend. Pastikan server Laravel berjalan.",
    );
  }
};
