import type { QueryClient } from "@tanstack/react-query";
import { careKeys } from "@/features/careitem/model/useCareQueries";
import { recordKeys } from "@/features/record/model/recordKeys";
import { proposalKeys } from "./useProposalQueries";
import { requestKeys } from "./useChangeRequests";
export async function invalidateReviewData(
  client: QueryClient,
  account: string | undefined,
  space: string,
) {
  await Promise.all(
    [
      proposalKeys.space(account, space),
      requestKeys.space(account, space),
      careKeys.space(account, space),
      recordKeys.space(account, space),
      ["dashboard", account, space],
    ].map((queryKey) => client.invalidateQueries({ queryKey })),
  );
}
