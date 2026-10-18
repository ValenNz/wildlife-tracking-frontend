export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
};

export type ApiValidationErrorResponse = {
  success: false;
  message: string;
  errors: Record<string, string[]>;
};

export type ApiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "validation"
  | "not_found"
  | "server"
  | "network"
  | "unknown";

export type ApiErrorState = {
  kind: ApiErrorKind;
  status: number;
  message: string;
  errors: Record<string, string[]> | null;
};

export const resolveErrorKind = (status: number): ApiErrorKind => {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
};

export const isApiErrorState = (value: unknown): value is ApiErrorState => {
  if (typeof value !== "object" || value === null) return false;

  return (
    "kind" in value &&
    "status" in value &&
    "message" in value &&
    typeof value.message === "string"
  );
};