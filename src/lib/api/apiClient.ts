import { ApiError, normalizeApiError } from "./apiError";
import {
  isApiResponse,
  type ApiPath,
  type ApiRequestOptions,
  type ApiResult,
  type ApiSuccess,
} from "./apiTypes";
import { getCsrfToken, resetCsrfToken } from "./csrf";
import { getApiUrl, httpClient } from "./httpClient";
import {
  ensureRequestSession,
  notifyUnauthenticated,
  trackApiRequest,
} from "./apiSession";

async function send(path: ApiPath, options: ApiRequestOptions = {}) {
  const protectedRequest = options.session !== "independent";
  const request = trackApiRequest(options.signal, protectedRequest);
  try {
    if (protectedRequest) await ensureRequestSession();
    request.assertCurrent();
    const url = getApiUrl(path);
    const method = options.method ?? "GET";
    const csrf = method !== "GET" ? await getCsrfToken() : undefined;
    request.assertCurrent();

    const response = await httpClient.request<unknown>({
      url,
      method,
      params: options.params,
      data: options.body,
      signal: request.signal,
      ...(options.timeoutMs !== undefined && { timeout: options.timeoutMs }),
      ...(csrf && { headers: { [csrf.headerName]: csrf.token } }),
    });
    request.assertCurrent();
    return response;
  } catch (error) {
    request.assertCurrent();
    // No redirect or automatic write retry: FORBIDDEN also means no permission.
    const failure = normalizeApiError(error);
    if (failure.status === 403 && options.method && options.method !== "GET")
      resetCsrfToken(); // A later explicit retry obtains a new token; never resend here.
    notifyUnauthenticated(failure);
    throw failure;
  } finally {
    request.release();
  }
}

async function request<T>(
  path: ApiPath,
  options?: ApiRequestOptions,
): Promise<ApiResult<T>> {
  const response = await send(path, options);
  if (!isApiResponse(response.data)) {
    throw new ApiError({
      kind: "invalid-response",
      status: response.status,
      message: "서버 응답 형식을 확인할 수 없습니다.",
    });
  }
  if (!response.data.success) {
    throw new ApiError({
      ...response.data,
      kind: "http",
      status: response.status,
    });
  }
  return { status: response.status, body: response.data as ApiSuccess<T> };
}

async function requestEmpty(
  path: ApiPath,
  options?: ApiRequestOptions,
): Promise<void> {
  const response = await send(path, options);
  if (response.status !== 204) {
    throw new ApiError({
      kind: "invalid-response",
      status: response.status,
      message: "본문 없는 204 응답을 확인할 수 없습니다.",
    });
  }
}

export const apiClient = { request, requestEmpty };
