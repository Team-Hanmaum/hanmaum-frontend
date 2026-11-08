import type { ApiResponse, CsrfToken } from "./apiTypes";

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

export function isCsrfToken(value: unknown): value is CsrfToken {
  return (
    typeof value === "object" &&
    value !== null &&
    "headerName" in value &&
    typeof value.headerName === "string" &&
    /^[!#$%&'*+.^_`|~\da-z-]+$/i.test(value.headerName) &&
    "token" in value &&
    typeof value.token === "string" &&
    Boolean(value.token)
  );
}
