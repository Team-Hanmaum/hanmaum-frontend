import type { QueryClient } from "@tanstack/react-query";
import { resetCsrfToken } from "@/lib/api";

// Shared boundary for confirmed logout, expired sessions, or an OAuth return.
// The auth flow decides navigation; this function does not create a session.
export async function resetSessionState(
  queryClient: QueryClient,
): Promise<void> {
  resetCsrfToken();
  await queryClient.cancelQueries();
  queryClient.clear();
}
