import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import { getSpaceDetail, getSpaceMembers } from "../api/spaceDetailApi";

export function useSpaceDetail(spaceId: string) {
  const session = useSession();
  return useQuery({
    queryKey: ["carespace", session.accountId, spaceId, "detail"],
    queryFn: ({ signal }) => getSpaceDetail(spaceId, signal),
    enabled: session.status === "authenticated",
  });
}
export function useSpaceMembers(spaceId: string) {
  const session = useSession();
  return useQuery({
    queryKey: ["carespace", session.accountId, spaceId, "members"],
    queryFn: ({ signal }) => getSpaceMembers(spaceId, signal),
    enabled: session.status === "authenticated",
  });
}
