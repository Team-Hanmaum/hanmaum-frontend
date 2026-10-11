import axios from "axios";
import { isApiResponse, type ApiFieldError } from "./apiTypes";

export type ApiErrorKind =
  | "http"
  | "network"
  | "timeout"
  | "cancelled"
  | "invalid-response"
  | "configuration"
  | "unknown";

interface ApiErrorOptions {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  code?: string;
  errors?: ApiFieldError[];
  timestamp?: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly errors: readonly ApiFieldError[];
  readonly timestamp: string | undefined;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = "ApiError";
    this.kind = options.kind;
    this.status = options.status;
    this.code = options.code;
    this.errors = options.errors ?? [];
    this.timestamp = options.timestamp;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (
    axios.isCancel(error) ||
    (error instanceof Error && error.name === "AbortError")
  ) {
    return new ApiError({
      kind: "cancelled",
      message: "요청이 취소되었습니다.",
    });
  }

  if (axios.isAxiosError<unknown>(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError({
        kind: "timeout",
        message: "응답 대기 시간이 초과되었습니다. 처리 결과를 확인해주세요.",
      });
    }

    if (error.response) {
      const { status, data } = error.response;
      if (isApiResponse(data) && !data.success) {
        return new ApiError({ ...data, kind: "http", status });
      }

      return new ApiError({
        kind: "http",
        status,
        message: "요청을 처리하지 못했습니다.",
      });
    }

    if (error.code === "ERR_BAD_RESPONSE") {
      return new ApiError({
        kind: "invalid-response",
        message: "서버 응답 형식을 확인할 수 없습니다.",
      });
    }

    if (error.request) {
      return new ApiError({
        kind: "network",
        message: "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.",
      });
    }
  }

  return new ApiError({
    kind: "unknown",
    message: "요청 중 오류가 발생했습니다.",
  });
}
