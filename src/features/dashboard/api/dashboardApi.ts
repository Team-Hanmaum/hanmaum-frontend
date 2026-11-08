import { readApiData } from "@/lib/api/responseData";
import type { DashboardResponse } from "./dashboardTypes";
import { isDashboard } from "./dashboardValidators";

export function getDashboard(
  spaceId: string,
  signal?: AbortSignal,
): Promise<DashboardResponse> {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}/dashboard`,
    (value): value is DashboardResponse =>
      isDashboard(value) && value.spaceId === spaceId,
    { signal },
  );
}
