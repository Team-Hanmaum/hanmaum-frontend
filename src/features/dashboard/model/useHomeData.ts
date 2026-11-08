import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import { getRecentRecords } from "@/features/record/api/recordReadApi";
import { getDashboard } from "../api/dashboardApi";
import { homePreviewLimits } from "./homePreviewLimits";

export function useHomeData(spaceId: string) {
  const session = useSession();
  const enabled = session.status === "authenticated";
  const dashboard = useQuery({
    queryKey: ["dashboard", session.accountId, spaceId],
    queryFn: ({ signal }) => getDashboard(spaceId, signal),
    enabled,
  });
  const news = useQuery({
    queryKey: ["records", session.accountId, spaceId, "home"],
    queryFn: ({ signal }) =>
      getRecentRecords(spaceId, homePreviewLimits.recentNews, signal),
    enabled,
  });
  return { dashboard, news };
}
