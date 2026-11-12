import { useQueries } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import { getProposal } from "../api/proposalReadApi";
import { proposalKeys } from "./useProposalQueries";
export function readSelectedIds(raw: string | null) {
  const values = raw?.split(",") ?? [];
  return values.length > 20
    ? []
    : [
        ...new Set(
          values.filter((v) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              v,
            ),
          ),
        ),
      ];
}
export function useSelectedProposals(space: string, ids: string[]) {
  const session = useSession();
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: proposalKeys.detail(session.accountId, space, id),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getProposal(space, id, signal),
      enabled: session.status === "authenticated",
    })),
  });
}
