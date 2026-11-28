"use server";

import { headers } from "next/headers";

import {
  ApiError,
  createServerApiClient,
  extractApiErrors,
  extractApiMessage,
  getLaravelApiBaseUrl,
  getPaginationMeta,
  readJsonResponse,
  resolveErrorKind,
} from "@/services/api";
import {
  clearAuthCookies,
  getAuthToken,
  setAuthCookies,
} from "@/services/cookie-token";
import {
  authenticateWithLaravel,
  registerWithLaravel,
} from "@/services/laravel-auth.service";
import type {
  BackendActionPayload,
  BackendActionResult,
  LoginActionResult,
  LogoutActionResult,
} from "@/types/backend-action.type";
import type { TYPE_LOGIN_REQUEST, TYPE_REGISTER_CHALLENGE, TYPE_REGISTER_REQUEST } from "@/types/auth.type";

const normalizePath = (path: string): string =>
  path.replace(/^\/api\/backend(?=\/|$)/, "") || "/";

const isSafeApiPath = (path: string): boolean => {
  if (!path.startsWith("/")) return false;
  if (
    path.includes("..") ||
    path.includes("//") ||
    path.includes("\\") ||
    path.includes("://") ||
    path.includes("@") ||
    path.includes("?") ||
    path.includes("#")
  ) {
    return false;
  }
  if (/[\x00-\x1f\x7f]/.test(path)) return false;
  return /^\/[A-Za-z0-9/_.-]*$/.test(path);
};

const unauthorizedResult = (): BackendActionResult => ({
  ok: false,
  status: 401,
  kind: resolveErrorKind(401),
  message: "Sesi tidak ditemukan. Silakan login kembali.",
  errors: null,
});

const encodeBytesToBase64 = (bytes: Uint8Array): string =>
  Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64");

const BINARY_CONTENT_TYPES = [
  "image/",
  "video/",
  "audio/",
  "text/csv",
  "application/geo+json",
  "application/pdf",
  "application/octet-stream",
  "model/",
];

const clientIpHeaders = async (): Promise<Record<string, string>> => {
  try {
    const incoming = await headers();
    const forwarded = incoming.get("x-forwarded-for")?.split(",").pop()?.trim();
    const ip = forwarded || incoming.get("x-real-ip")?.trim() || "";
    return /^[0-9a-fA-F:.]{3,45}$/.test(ip) ? { "X-Forwarded-For": ip } : {};
  } catch {
    return {};
  }
};

export const registerChallengeAction = async (): Promise<
  { ok: true; challenge: TYPE_REGISTER_CHALLENGE } | { ok: false; message: string }
> => {
  try {
    const serverApi = createServerApiClient(getLaravelApiBaseUrl());
    const response = (await serverApi.get("/register/challenge", { headers: await clientIpHeaders() })) as {
      data?: TYPE_REGISTER_CHALLENGE;
    };
    return { ok: true, challenge: response?.data ?? null };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiError && error.status === 429
          ? "Terlalu banyak permintaan. Tunggu sebentar."
          : "Tidak dapat memuat soal keamanan. Pastikan server berjalan.",
    };
  }
};

export const loginAction = async (
  payload: TYPE_LOGIN_REQUEST,
): Promise<LoginActionResult> => {
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (email.length === 0 || password.length === 0) {
    return {
      ok: false,
      status: 422,
      message: "Email dan kata sandi wajib diisi.",
      errors: {
        email: email.length === 0 ? ["Email wajib diisi"] : [],
        password: password.length === 0 ? ["Kata sandi wajib diisi"] : [],
      },
    };
  }

  try {
    const result = await authenticateWithLaravel({ email, password }, await clientIpHeaders());

    if (!result.ok) {
      return {
        ok: false,
        status: result.status,
        message: result.message,
        errors: result.errors,
      };
    }

    await setAuthCookies(result.user, result.token);

    return {
      ok: true,
      message: "Login berhasil.",
      user: result.user,
    };
  } catch {
    return {
      ok: false,
      status: 503,
      message:
        "Tidak dapat menghubungi API backend. Pastikan server Laravel berjalan.",
      errors: null,
    };
  }
};

export const registerAction = async (
  payload: TYPE_REGISTER_REQUEST,
): Promise<LoginActionResult> => {
  const read = (value: unknown) => (typeof value === "string" ? value : "");
  const clean: TYPE_REGISTER_REQUEST = {
    full_name: read(payload?.full_name).trim(),
    username: read(payload?.username).trim(),
    email: read(payload?.email).trim(),
    phone: read(payload?.phone).trim(),
    password: read(payload?.password),
    password_confirmation: read(payload?.password_confirmation),
    captcha_token: read(payload?.captcha_token),
    captcha_answer: read(payload?.captcha_answer).trim(),
    website: read(payload?.website),
  };

  try {
    const result = await registerWithLaravel(clean, await clientIpHeaders());

    if (!result.ok) {
      return {
        ok: false,
        status: result.status,
        message: result.message,
        errors: result.errors,
      };
    }

    await setAuthCookies(result.user, result.token);

    return { ok: true, message: "Pendaftaran berhasil. Selamat datang!", user: result.user };
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Tidak dapat menghubungi API backend. Pastikan server Laravel berjalan.",
      errors: null,
    };
  }
};

export const logoutAction = async (): Promise<LogoutActionResult> => {
  const token = await getAuthToken();
  let result: LogoutActionResult = { ok: true, message: "Logout berhasil." };

  if (token) {
    try {
      const serverApi = createServerApiClient(getLaravelApiBaseUrl());
      await serverApi.post("/logout", { token });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        result = {
          ok: false,
          status: 401,
          message: "Sesi telah berakhir. Silakan login kembali.",
        };
      } else if (error instanceof ApiError && error.status === 0) {
        result = {
          ok: false,
          status: 503,
          message:
            "Tidak dapat menghubungi API backend. Token lokal tetap dihapus.",
        };
      } else {
        result = {
          ok: false,
          status: error instanceof ApiError ? error.status : 503,
          message:
            "Gagal mencabut token di backend. Token lokal tetap dihapus.",
        };
      }
    }
  }

  await clearAuthCookies();

  return result;
};

export const forwardBackendAction = async (
  payload: BackendActionPayload,
): Promise<BackendActionResult> => {
  const token = await getAuthToken();

  if (!token) return unauthorizedResult();

  const safePath = normalizePath(payload.path);
  if (!isSafeApiPath(safePath)) {
    return {
      ok: false,
      status: 400,
      kind: resolveErrorKind(400),
      message: "Path permintaan tidak valid.",
      errors: null,
    };
  }

  const contentType = payload.headers?.["Content-Type"];
  const requestHeaders: Record<string, string> = {
    ...(await clientIpHeaders()),
    ...(typeof contentType === "string" ? { "Content-Type": contentType } : {}),
  };

  try {
    const serverApi = createServerApiClient(getLaravelApiBaseUrl());
    const response = await serverApi.requestRaw(
      payload.method,
      safePath,
      {
        params: payload.params,
        body: payload.body,
        bodyText: payload.bodyText,
        formData: payload.formData,
        headers: requestHeaders,
        token,
        timeoutMs: payload.timeoutMs,
      },
    );

    if (response.status === 204) {
      return {
        ok: true,
        status: response.status,
        body: undefined,
        meta: getPaginationMeta(response.headers),
      };
    }

    const responseContentType = response.headers.get("content-type") ?? "";
    const disposition = response.headers.get("content-disposition") ?? "";
    const isBinaryResponse =
      response.ok &&
      (BINARY_CONTENT_TYPES.some((type) => responseContentType.includes(type)) ||
        disposition.includes("attachment"));

    if (isBinaryResponse) {
      const bytes = new Uint8Array(await response.arrayBuffer());

      return {
        ok: true,
        status: response.status,
        body: undefined,
        base64: encodeBytesToBase64(bytes),
        contentType: responseContentType,
        filename: /filename="?([^";]+)"?/i.exec(disposition)?.[1],
        meta: getPaginationMeta(response.headers),
      };
    }

    const body = await readJsonResponse(response);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        kind: resolveErrorKind(response.status),
        message: extractApiMessage(
          body,
          `Permintaan gagal dengan status ${response.status}.`,
        ),
        errors: extractApiErrors(body),
      };
    }

    return {
      ok: true,
      status: response.status,
      body,
      meta: getPaginationMeta(response.headers),
    };
  } catch {
    return {
      ok: false,
      status: 503,
      kind: "network",
      message: "Tidak dapat menghubungi backend Laravel.",
      errors: null,
    };
  }
};
