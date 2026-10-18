import { getAuthToken } from "@/services/cookieToken";
import type { ApiResponse } from "@/types/api.type";

const FALLBACK_BASE_URL = "http://localhost:8000/api";
const DEFAULT_TIMEOUT_MS = 10000;
const SEGMENT_PATTERN = /^[a-zA-Z0-9_-]+$/;

const ALLOWED_RESOURCES = new Set([
  "animals",
  "species",
  "devices",
  "gps-readings",
  "incidents",
  "notifications",
  "geo-zones",
]);

export class LaravelProxyError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "LaravelProxyError";
    this.status = status;
    this.payload = payload;
  }
}

const getBaseUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  const base = configured && configured.length > 0 ? configured : FALLBACK_BASE_URL;

  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const assertSafePath = (segments: string[]): void => {
  if (segments.length === 0 || segments.length > 2) {
    throw new LaravelProxyError(
      404,
      "Resource tidak ditemukan pada API backend.",
      null,
    );
  }

  const [resource, detail] = segments;

  if (!resource || !ALLOWED_RESOURCES.has(resource)) {
    throw new LaravelProxyError(
      404,
      `Resource "${resource ?? ""}" tidak diizinkan oleh proxy.`,
      null,
    );
  }

  if (detail !== undefined && !SEGMENT_PATTERN.test(detail)) {
    throw new LaravelProxyError(400, "Parameter path tidak valid.", null);
  }
};

const normalizePayload = (payload: unknown): ApiResponse<unknown> => {
  if (Array.isArray(payload)) {
    return { success: true, message: "Data berhasil diambil.", data: payload };
  }

  if (typeof payload !== "object" || payload === null) {
    return { success: true, message: "Data berhasil diambil.", data: null };
  }

  const record = payload as Record<string, unknown>;
  const success = record.success === undefined ? true : record.success === true;
  const message =
    typeof record.message === "string" && record.message.length > 0
      ? record.message
      : "Data berhasil diambil.";

  return {
    success,
    message,
    data: "data" in record ? record.data : record,
  };
};

const readPayload = async (response: Response): Promise<unknown> => {
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

export const fetchFromLaravel = async <T>(
  segments: string[],
  searchParams: URLSearchParams,
): Promise<ApiResponse<T>> => {
  assertSafePath(segments);

  const path = segments.join("/");
  const query = searchParams.toString();
  const target = `${getBaseUrl()}/${path}${query ? `?${query}` : ""}`;

  const controller = new AbortController();
  const timeoutMs = DEFAULT_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const token = await getAuthToken();

    const response = await fetch(target, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    const payload = await readPayload(response);

    if (!response.ok) {
      const message =
        typeof payload === "object" &&
        payload !== null &&
        "message" in payload &&
        typeof payload.message === "string"
          ? payload.message
          : `Permintaan ke backend gagal dengan status ${response.status}.`;

      throw new LaravelProxyError(response.status, message, payload);
    }

    return normalizePayload(payload) as ApiResponse<T>;
  } catch (error) {
    if (error instanceof LaravelProxyError) throw error;

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new LaravelProxyError(
        504,
        `Backend tidak merespons dalam ${timeoutMs}ms.`,
        null,
      );
    }

    throw new LaravelProxyError(
      503,
      "Tidak dapat terhubung ke API backend. Pastikan server Laravel berjalan di port 8000.",
      null,
    );
  } finally {
    clearTimeout(timer);
  }
};