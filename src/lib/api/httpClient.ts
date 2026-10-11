import axios from "axios";
import { getApiBaseUrl } from "@/lib/env";
import { ApiError } from "./apiError";
import type { ApiPath } from "./apiTypes";

// Internal transport. Domain code uses apiClient to preserve CSRF/error handling.
export const httpClient = axios.create({
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: "application/json" },
  responseType: "json",
  transitional: { silentJSONParsing: false },
  // Our CSRF token comes from JSON, not a JavaScript-readable cookie.
  withXSRFToken: false,
});

export function getApiUrl(path: ApiPath): string {
  try {
    const origin = getApiBaseUrl();
    const url = new URL(path, origin);
    if (
      !path.startsWith("/api/") ||
      url.origin !== origin ||
      !url.pathname.startsWith("/api/") ||
      url.hash
    ) {
      throw new Error(
        "API 요청 경로는 같은 서버의 /api/ 하위 경로여야 합니다.",
      );
    }
    return url.href;
  } catch (error) {
    throw new ApiError({
      kind: "configuration",
      message:
        error instanceof Error ? error.message : "API 설정을 확인해주세요.",
    });
  }
}
