import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: (failureCount, error) => {
        if (failureCount >= 1 || !(error instanceof ApiError)) return false;
        return (
          error.kind === "network" ||
          error.kind === "timeout" ||
          (error.kind === "http" &&
            [500, 502, 503, 504].includes(error.status ?? 0))
        );
      },
    },
    mutations: {
      // A timeout is not proof that a write failed. The domain owns resubmission.
      retry: false,
    },
  },
});
