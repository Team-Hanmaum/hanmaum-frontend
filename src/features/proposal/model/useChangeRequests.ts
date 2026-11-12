import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import { getChangeRequests, getChangeRequest } from "../api/changeRequestApi";
import type { RequestStatus } from "../api/changeRequestTypes";
export const requestKeys = {
  space: (account: string | undefined, space: string) =>
    ["change-requests", account, space] as const,
};
export function useChangeRequests(
  space: string,
  status: RequestStatus = "PENDING",
) {
  const session = useSession();
  return useInfiniteQuery({
    queryKey: [...requestKeys.space(session.accountId, space), "list", status],
    queryFn: ({ pageParam, signal }) =>
      getChangeRequests(space, status, pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (last) =>
      last.hasNext && last.nextCursor ? last.nextCursor : undefined,
    enabled: session.status === "authenticated",
  });
}
export function useChangeRequest(space: string, id: string) {
  const session = useSession();
  return useQuery({
    queryKey: [...requestKeys.space(session.accountId, space), "detail", id],
    queryFn: ({ signal }) => getChangeRequest(space, id, signal),
    enabled: session.status === "authenticated" && !!id,
  });
}
