import { ApiError, normalizeApiError } from "./apiError";
import type { CsrfToken } from "./apiTypes";
import { getApiUrl, httpClient } from "./httpClient";

let cachedToken: CsrfToken | undefined;
let generation = 0;
let pending:
  { controller: AbortController; promise: Promise<CsrfToken> } | undefined;

async function fetchCsrfToken(signal: AbortSignal): Promise<CsrfToken> {
  try {
    const response = await httpClient.get<unknown>(
      getApiUrl("/api/auth/csrf"),
      {
        signal,
      },
    );
    const value = response.data;
    if (
      response.status !== 200 ||
      typeof value !== "object" ||
      value === null ||
      !("headerName" in value) ||
      typeof value.headerName !== "string" ||
      !/^[!#$%&'*+.^_`|~\da-z-]+$/i.test(value.headerName) ||
      !("token" in value) ||
      typeof value.token !== "string" ||
      !value.token
    ) {
      throw new ApiError({
        kind: "invalid-response",
        status: response.status,
        message: "CSRF 응답 형식을 확인할 수 없습니다.",
      });
    }

    return { headerName: value.headerName, token: value.token };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getCsrfToken(): Promise<CsrfToken> {
  const currentGeneration = generation;
  if (!cachedToken && !pending) {
    const controller = new AbortController();
    const promise = fetchCsrfToken(controller.signal)
      .then((token) => {
        if (generation === currentGeneration) cachedToken = token;
        return token;
      })
      .finally(() => {
        if (pending?.promise === promise) pending = undefined;
      });
    pending = { controller, promise };
  }

  const token = cachedToken ?? (await pending!.promise);
  if (generation !== currentGeneration) {
    throw new ApiError({
      kind: "cancelled",
      message: "세션이 변경되어 CSRF 요청이 취소되었습니다.",
    });
  }
  return token;
}

// Call after login/logout; the next write obtains a fresh session-bound token.
export function resetCsrfToken(): void {
  generation += 1;
  cachedToken = undefined;
  pending?.controller.abort();
  pending = undefined;
}
