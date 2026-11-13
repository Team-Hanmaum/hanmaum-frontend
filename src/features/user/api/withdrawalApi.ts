import { apiClient } from "@/lib/api";
import type { WithdrawalBody } from "./withdrawalTypes";

// The session controller verifies the identity and blocks other account requests
// before this destructive operation. Success is strictly an empty 204 response.
export function withdrawMember(body: WithdrawalBody): Promise<void> {
  return apiClient.requestEmpty("/api/users/me/withdrawals", {
    method: "POST",
    session: "independent",
    body,
  });
}
