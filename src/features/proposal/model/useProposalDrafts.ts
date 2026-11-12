import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import type { ProposalDraft } from "./proposalDraft";
// QueryClient와 함께 초기화되는 메모리 초안. 계정/공간별로 분리하며 저장소에는 기록하지 않는다.
export function useProposalDrafts(space: string) {
  const session = useSession();
  const client = useQueryClient();
  const key = ["review-drafts", session.accountId, space] as const;
  const { data = {} } = useQuery<Record<string, ProposalDraft>>({
    queryKey: key,
    queryFn: skipToken,
    initialData: {},
    enabled: false,
    staleTime: Infinity,
  });
  return {
    drafts: data,
    save: (id: string, value: ProposalDraft) =>
      client.setQueryData<Record<string, ProposalDraft>>(key, (previous) => ({
        ...previous,
        [id]: value,
      })),
    clear: () => client.removeQueries({ queryKey: key }),
  };
}
