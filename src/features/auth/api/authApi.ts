import { apiClient } from "@/lib/api";

export async function logout(): Promise<void> {
  await apiClient.requestEmpty("/api/auth/logout", { method: "POST" });
}
