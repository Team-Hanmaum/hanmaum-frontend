import type { QueryClient } from "@tanstack/react-query";
import { careKeys } from "@/features/careitem/model/useCareQueries";
import { careSpaceKeys } from "@/features/carespace/model/careSpaceKeys";
import { recordKeys } from "@/features/record/model/recordKeys";
import type { MyProfile } from "@/features/user/api/userTypes";
import { userKeys } from "@/features/user/model/userKeys";
import { proposalKeys } from "./useProposalQueries";
import { requestKeys } from "./useChangeRequests";
export async function invalidateReviewData(
  client: QueryClient,
  account: string | undefined,
  space: string,
) {
  // 공간 목록 키는 계정 ID를 포함하지 않으므로 늦게 끝난 이전 계정 작업을 막는다.
  const profile = client.getQueryData<MyProfile>(userKeys.me());
  if (!account || profile?.userId !== account) return;
  const queries = new Set(
    [
      proposalKeys.space(account, space),
      requestKeys.space(account, space),
      careKeys.space(account, space),
      recordKeys.space(account, space),
      ["dashboard", account, space],
      ["carespace", account, space],
      careSpaceKeys.list(),
    ].flatMap((queryKey) => client.getQueryCache().findAll({ queryKey })),
  );
  // 세션 전환 후 같은 키로 생성된 다른 계정의 Query는 포함하지 않는다.
  await client.invalidateQueries({ predicate: (query) => queries.has(query) });
}
