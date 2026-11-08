import { apiClient } from "./apiClient";
import { ApiError } from "./apiError";
import type { ApiPath, ApiRequestOptions } from "./apiTypes";

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
export const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";
export const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
export const isTimestamp = (value: unknown): value is string =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

export async function readApiData<T>(
  path: ApiPath,
  validate: (value: unknown) => value is T,
  options?: ApiRequestOptions,
): Promise<T> {
  const result = await apiClient.request<unknown>(path, options);
  if (!validate(result.body.data))
    throw new ApiError({
      kind: "invalid-response",
      status: result.status,
      message: "서버 응답 형식을 확인할 수 없습니다.",
    });
  return result.body.data;
}
