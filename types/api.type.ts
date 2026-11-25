import type { TYPE_META_PAGGINATION } from "@/types/meta.type";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
  meta?: TYPE_META_PAGGINATION | null;
};

export type ApiListResult<T> = {
  body: T;
  meta: TYPE_META_PAGGINATION | null;
};

export type ApiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "validation"
  | "not_found"
  | "client"
  | "server"
  | "network"
  | "unknown";

export type ApiErrorState = {
  kind: ApiErrorKind;
  status: number;
  message: string;
  errors: Record<string, string[]> | null;
};

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  body?: unknown;
  bodyText?: string;
  formData?: FormData;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  token?: string;
  timeoutMs?: number;
};

export type ApiClientConfig = {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
};

export type BlobResponse = {
  blob: Blob;
  contentType: string;
  filename?: string;
};

export type ApiClient = {
  request<T>(
    method: HttpMethod,
    path: string,
    options?: RequestOptions,
  ): Promise<T>;
  requestRaw(
    method: HttpMethod,
    path: string,
    options?: RequestOptions,
  ): Promise<Response>;
  requestList<T>(
    method: HttpMethod,
    path: string,
    options?: RequestOptions,
  ): Promise<ApiListResult<T>>;
  getBlob(path: string, options?: RequestOptions): Promise<BlobResponse>;
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, options?: RequestOptions): Promise<T>;
  put<T>(path: string, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
};

export const resolveErrorKind = (status: number): ApiErrorKind => {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 422) return "validation";
  if (status === 400 || status === 409) return "client";
  if (status >= 500) return "server";
  return "unknown";
};
