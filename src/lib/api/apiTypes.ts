export interface ApiFieldError {
  field: string;
  reason: string;
}

interface ApiResponseBase {
  code: string;
  message: string;
  errors: ApiFieldError[];
  timestamp: string;
}

export interface ApiSuccess<T> extends ApiResponseBase {
  success: true;
  data: T;
}

export interface ApiFailure extends ApiResponseBase {
  success: false;
  data: null;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// Keep HTTP status and response metadata: 202 ACCEPTED is not task completion.
export interface ApiResult<T> {
  status: number;
  body: ApiSuccess<T>;
}

export type ApiPath = `/api/${string}`;
export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  method?: ApiMethod;
  params?: Record<string, QueryValue | QueryValue[]>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface CsrfToken {
  headerName: string;
  token: string;
}

export function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== "object" || value === null) return false;

  const response = value as Record<string, unknown>;
  return (
    typeof response.success === "boolean" &&
    typeof response.code === "string" &&
    typeof response.message === "string" &&
    Object.hasOwn(response, "data") &&
    (response.success || response.data === null) &&
    typeof response.timestamp === "string" &&
    Array.isArray(response.errors) &&
    response.errors.every(
      (error: unknown) =>
        typeof error === "object" &&
        error !== null &&
        "field" in error &&
        typeof error.field === "string" &&
        "reason" in error &&
        typeof error.reason === "string",
    )
  );
}
