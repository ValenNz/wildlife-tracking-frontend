import { resolveErrorKind } from "@/types/api.type";
import type { ApiErrorKind, ApiErrorState, ApiResponse } from "@/types/api.type";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 10000;

const buildQuery = (params: RequestOptions["params"]): string => {
  if (!params) return "";

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
};

const readJson = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { message: text.slice(0, 300) } : null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

const extractErrors = (body: unknown): Record<string, string[]> | null => {
  if (typeof body !== "object" || body === null || !("errors" in body)) return null;

  const errors = body.errors;

  if (typeof errors !== "object" || errors === null) return null;

  const normalized: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(errors)) {
    normalized[field] = Array.isArray(messages)
      ? messages.map((message) => String(message))
      : [String(messages)];
  }

  return normalized;
};

const extractMessage = (body: unknown, fallback: string): string => {
  if (typeof body !== "object" || body === null) return fallback;
  if (!("message" in body)) return fallback;
  if (typeof body.message !== "string" || body.message.length === 0) return fallback;

  return body.message;
};

export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly errors: Record<string, string[]> | null;

  constructor(
    status: number,
    kind: ApiErrorKind,
    message: string,
    errors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
    this.errors = errors;
  }
}

const request = async <T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${path}${buildQuery(options.params)}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      cache: "no-store",
    });

    const body = await readJson(response);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        resolveErrorKind(response.status),
        extractMessage(body, `Permintaan gagal dengan status ${response.status}.`),
        extractErrors(body),
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        0,
        "network",
        `Permintaan ke ${path} melewati batas waktu ${timeoutMs}ms.`,
      );
    }

    throw new ApiError(
      0,
      "network",
      "Tidak dapat terhubung ke server. Pastikan API backend berjalan.",
    );
  } finally {
    clearTimeout(timer);
  }
};

export const api = {
  get: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>("GET", path, options),
  post: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>("POST", path, options),
  put: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>("PUT", path, options),
  patch: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>("PATCH", path, options),
  delete: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>("DELETE", path, options),
};

export const unwrapData = <T>(response: ApiResponse<T>): T => {
  if (!response || typeof response !== "object" || response.data === undefined) {
    throw new ApiError(0, "unknown", "Format respons API tidak dikenali.");
  }

  return response.data;
};

export const toApiErrorState = (error: unknown): ApiErrorState => {
  if (error instanceof ApiError) {
    return {
      kind: error.kind,
      status: error.status,
      message: error.message,
      errors: error.errors,
    };
  }

  if (error instanceof Error) {
    return {
      kind: "unknown",
      status: 0,
      message: error.message,
      errors: null,
    };
  }

  return {
    kind: "unknown",
    status: 0,
    message: "Terjadi kesalahan yang tidak diketahui.",
    errors: null,
  };
};