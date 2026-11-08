import { apiClient } from "./apiClient";
import { ApiError } from "./apiError";
import type { ApiPath, ApiRequestOptions } from "./apiTypes";

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
