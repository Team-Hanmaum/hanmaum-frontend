import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import { getProposals, getProposal } from "../api/proposalReadApi";
import type { ProposalStatus } from "../api/proposalReadTypes";
export const proposalKeys = {
  space: (account: string | undefined, space: string) =>
    ["proposals", account, space] as const,
  detail: (account: string | undefined, space: string, id: string) =>
    [...proposalKeys.space(account, space), "detail", id] as const,
};
export function useProposalList(
  spaceId: string,
  status: ProposalStatus = "REVIEW_PENDING",
  recordId?: string,
) {
  const session = useSession();
  return useInfiniteQuery({
    queryKey: [
      ...proposalKeys.space(session.accountId, spaceId),
      "list",
      status,
      recordId,
    ],
    queryFn: ({ pageParam, signal }) =>
      getProposals(spaceId, status, recordId, pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (last) =>
      last.hasNext && last.nextCursor ? last.nextCursor : undefined,
    enabled: session.status === "authenticated",
  });
}
export function useProposal(spaceId: string, proposalId: string) {
  const session = useSession();
  return useQuery({
    queryKey: proposalKeys.detail(session.accountId, spaceId, proposalId),
    queryFn: ({ signal }) => getProposal(spaceId, proposalId, signal),
    enabled: session.status === "authenticated" && !!proposalId,
  });
}
