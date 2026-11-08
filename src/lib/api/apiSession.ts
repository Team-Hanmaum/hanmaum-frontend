import { ApiError } from "./apiError";

// Transport lifecycle only. Authentication state and navigation belong to auth/routes.
let generation = 0;
let protectedGeneration = 0;
const requests = new Map<AbortController, boolean>();
const listeners = new Set<() => void>();
let sessionGuard: (() => Promise<void>) | undefined;

export function registerSessionGuard(guard: () => Promise<void>) {
  sessionGuard = guard;
  return () => {
    if (sessionGuard === guard) sessionGuard = undefined;
  };
}

export async function ensureRequestSession() {
  if (!sessionGuard)
    throw new ApiError({
      kind: "cancelled",
      message: "로그인 상태를 먼저 확인해 주세요.",
    });
  await sessionGuard();
}

export function trackApiRequest(signal?: AbortSignal, protectedRequest = true) {
  const controller = new AbortController();
  const currentGeneration = generation;
  const currentProtectedGeneration = protectedGeneration;
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });
  requests.set(controller, protectedRequest);
  return {
    signal: controller.signal,
    assertCurrent() {
      if (
        controller.signal.aborted ||
        currentGeneration !== generation ||
        (protectedRequest && currentProtectedGeneration !== protectedGeneration)
      )
        throw new ApiError({
          kind: "cancelled",
          message: "요청이 취소되었습니다.",
        });
    },
    release() {
      signal?.removeEventListener("abort", abort);
      requests.delete(controller);
    },
  };
}

export function cancelApiRequests() {
  generation += 1;
  for (const request of requests.keys()) request.abort();
  requests.clear();
}

// Preserve already displayed data, but never accept results crossing an uncertain identity.
export function cancelProtectedRequests() {
  protectedGeneration += 1;
  for (const [request, protectedRequest] of requests) {
    if (protectedRequest) {
      request.abort();
      requests.delete(request);
    }
  }
}

export function isUnauthenticated(error: unknown): error is ApiError {
  return (
    error instanceof ApiError &&
    error.status === 401 &&
    error.code === "UNAUTHENTICATED"
  );
}

export function notifyUnauthenticated(error: ApiError) {
  if (isUnauthenticated(error)) listeners.forEach((listener) => listener());
}

export function onUnauthenticated(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
