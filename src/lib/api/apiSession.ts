import { ApiError } from "./apiError";

// Transport lifecycle only. Authentication state and navigation belong to auth/routes.
let generation = 0;
const requests = new Set<AbortController>();
const listeners = new Set<() => void>();

export function trackApiRequest(signal?: AbortSignal) {
  const controller = new AbortController();
  const currentGeneration = generation;
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });
  requests.add(controller);
  return {
    signal: controller.signal,
    assertCurrent() {
      if (controller.signal.aborted || currentGeneration !== generation)
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
  for (const request of requests) request.abort();
  requests.clear();
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
