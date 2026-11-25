import { forwardBackendAction } from "@/services/backend-actions";
import { resolveErrorKind } from "@/types/api.type";
import type {
  ApiClient,
  ApiClientConfig,
  ApiErrorKind,
  ApiErrorState,
  ApiListResult,
  ApiResponse,
  BlobResponse,
  HttpMethod,
  RequestOptions,
} from "@/types/api.type";
import type { BackendActionResult } from "@/types/backend-action.type";
import type { TYPE_META_PAGGINATION } from "@/types/meta.type";

export { resolveErrorKind };

const DEFAULT_TIMEOUT_MS = 10000;
const FALLBACK_BASE_URL = "http://127.0.0.1:8000/api";

export const getLaravelApiBaseUrl = (): string => {
  const configured =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    FALLBACK_BASE_URL;

  return configured.replace(/\/+$/, "");
};

const buildQuery = (params: RequestOptions["params"]): string => {
  if (!params) return "";

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      search.append(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
};

const buildUrl = (config: ApiClientConfig, path: string): string => {
  if (!config.baseUrl) return path;

  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${config.baseUrl}${suffix}`;
};

const readHeaderNumber = (value: string | null): number | null => {
  if (value === null || value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : null;
};

export const getPaginationMeta = (
  headers: Headers,
): TYPE_META_PAGGINATION | null => {
  const total = readHeaderNumber(headers.get("X-Total-Count"));

  if (total === null) return null;

  const page = readHeaderNumber(headers.get("X-Current-Page")) ?? 1;
  const perPage = readHeaderNumber(headers.get("X-Per-Page")) ?? total;
  const lastPage = readHeaderNumber(headers.get("X-Last-Page"));
  const totalPages =
    lastPage ?? (perPage > 0 ? Math.ceil(total / perPage) : 1);

  return {
    total,
    total_items: total,
    page,
    per_page: perPage,
    total_pages: totalPages,
  };
};

export const buildFallbackMeta = (
  total: number,
  page = 1,
  perPage = total,
): TYPE_META_PAGGINATION => ({
  total,
  total_items: total,
  page: page > 0 ? page : 1,
  per_page: perPage > 0 ? perPage : total,
  total_pages: perPage > 0 ? Math.ceil(total / perPage) : 1,
});

const resolveBody = (
  method: HttpMethod,
  options: RequestOptions,
): BodyInit | undefined => {
  if (method === "GET") return undefined;
  if (options.formData) return options.formData;
  if (options.bodyText !== undefined) return options.bodyText;
  if (options.body === undefined) return undefined;
  return JSON.stringify(options.body);
};

export const readJsonResponse = async (response: Response): Promise<unknown> => {
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

export const extractApiErrors = (
  body: unknown,
): Record<string, string[]> | null => {
  if (typeof body !== "object" || body === null || !("errors" in body)) {
    return null;
  }

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

export const extractApiMessage = (body: unknown, fallback: string): string => {
  if (typeof body !== "object" || body === null) return fallback;
  if (!("message" in body)) return fallback;
  if (typeof body.message !== "string" || body.message.length === 0) {
    return fallback;
  }

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

const normalizeRequestError = (
  error: unknown,
  path: string,
  timeoutMs: number,
): never => {
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
};

const decodeBase64ToBytes = (value: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

export const createApiClient = (config: ApiClientConfig = {}): ApiClient => {
  const requestRaw = async (
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<Response> => {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        ...(options.formData ? {} : { "Content-Type": "application/json" }),
        ...config.defaultHeaders,
        ...options.headers,
      };

      if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
      }

      return await fetch(
        `${buildUrl(config, path)}${buildQuery(options.params)}`,
        {
          method,
          signal: controller.signal,
          headers,
          body: resolveBody(method, options),
          cache: "no-store",
        },
      );
    } finally {
      clearTimeout(timer);
    }
  };

  const request = async <T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    try {
      const response = await requestRaw(method, path, options);

      if (response.status === 204) return undefined as T;

      const body = await readJsonResponse(response);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          resolveErrorKind(response.status),
          extractApiMessage(
            body,
            `Permintaan gagal dengan status ${response.status}.`,
          ),
          extractApiErrors(body),
        );
      }

      return body as T;
    } catch (error) {
      return normalizeRequestError(
        error,
        path,
        options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      );
    }
  };

  const requestList = async <T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiListResult<T>> => {
    try {
      const response = await requestRaw(method, path, options);

      if (response.status === 204) {
        return { body: undefined as T, meta: null };
      }

      const body = await readJsonResponse(response);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          resolveErrorKind(response.status),
          extractApiMessage(
            body,
            `Permintaan gagal dengan status ${response.status}.`,
          ),
          extractApiErrors(body),
        );
      }

      return {
        body: body as T,
        meta: getPaginationMeta(response.headers),
      };
    } catch (error) {
      return normalizeRequestError(
        error,
        path,
        options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      );
    }
  };

  const getBlob = async (
    path: string,
    options: RequestOptions = {},
  ): Promise<BlobResponse> => {
    try {
      const response = await requestRaw("GET", path, options);

      if (!response.ok) {
        const body = await readJsonResponse(response);
        throw new ApiError(
          response.status,
          resolveErrorKind(response.status),
          extractApiMessage(
            body,
            `Permintaan gagal dengan status ${response.status}.`,
          ),
          extractApiErrors(body),
        );
      }

      const blob = await response.blob();
      const contentType =
        response.headers.get("content-type") ??
        blob.type ??
        "application/octet-stream";

      return { blob, contentType };
    } catch (error) {
      return normalizeRequestError(
        error,
        path,
        options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      );
    }
  };

  return {
    request,
    requestRaw,
    requestList,
    getBlob,
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
};

export const createServerApiClient = (baseUrl: string): ApiClient =>
  createApiClient({ baseUrl });

const runBackendAction = async (
  method: HttpMethod,
  path: string,
  options: RequestOptions,
): Promise<BackendActionResult> => {
  try {
    return await forwardBackendAction({
      method,
      path,
      params: options.params,
      body: options.body,
      bodyText: options.bodyText,
      formData: options.formData,
      headers: options.headers,
      timeoutMs: options.timeoutMs,
    });
  } catch {
    return {
      ok: false,
      status: 503,
      kind: "network",
      message: "Tidak dapat terhubung ke server aplikasi.",
      errors: null,
    };
  }
};

const toActionApiError = (result: Extract<BackendActionResult, { ok: false }>): ApiError =>
  new ApiError(result.status, result.kind, result.message, result.errors);

const createActionApiClient = (): ApiClient => {
  const request = async <T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    const result = await runBackendAction(method, path, options);

    if (!result.ok) throw toActionApiError(result);

    if (result.status === 204 || result.body === undefined) {
      return undefined as T;
    }

    return result.body as T;
  };

  const requestRaw = async (
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<Response> => {
    const result = await runBackendAction(method, path, options);

    if (!result.ok) throw toActionApiError(result);

    if (result.status === 204 || result.body === undefined) {
      return new Response(null, { status: result.status });
    }

    if (result.base64) {
      return new Response(decodeBase64ToBytes(result.base64).buffer, {
        status: result.status,
        headers: {
          "Content-Type": result.contentType ?? "application/octet-stream",
        },
      });
    }

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  };

  const requestList = async <T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiListResult<T>> => {
    const result = await runBackendAction(method, path, options);

    if (!result.ok) throw toActionApiError(result);

    return {
      body: result.body as T,
      meta: result.meta ?? null,
    };
  };

  const getBlob = async (
    path: string,
    options: RequestOptions = {},
  ): Promise<BlobResponse> => {
    const result = await runBackendAction("GET", path, options);

    if (!result.ok) throw toActionApiError(result);

    if (!result.base64) {
      throw new ApiError(0, "unknown", "Respons file tidak dikenali.");
    }

    const contentType = result.contentType ?? "application/octet-stream";

    return {
      blob: new Blob([decodeBase64ToBytes(result.base64).buffer], {
        type: contentType,
      }),
      contentType,
      filename: result.filename,
    };
  };

  return {
    request,
    requestRaw,
    requestList,
    getBlob,
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
};

export const api = createActionApiClient();

export const unwrapData = <T>(response: ApiResponse<T>): T => {
  if (!response || typeof response !== "object" || response.data === undefined) {
    throw new ApiError(0, "unknown", "Format respons API tidak dikenali.");
  }

  return response.data;
};

export const formatApiMessage = (
  message: string,
  errors: Record<string, string[]> | null,
  fallback: string,
): string => {
  const detail = Object.entries(errors ?? {})
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .filter((entry) => entry.trim() !== "")
    .join(" ");

  return [message, detail].filter((entry) => entry.trim() !== "").join(" ") || fallback;
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

export const formatApiError = (error: unknown, fallback: string): string => {
  const state = toApiErrorState(error);
  return formatApiMessage(state.message, state.errors, fallback);
};

export const getApiFieldErrors = (error: unknown): Record<string, string> => {
  const errors = toApiErrorState(error).errors ?? {};
  const fieldErrors: Record<string, string> = {};

  for (const [field, messages] of Object.entries(errors)) {
    const [firstMessage] = messages;
    if (firstMessage) fieldErrors[field] = firstMessage;
  }

  return fieldErrors;
};
