import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import {
  applyRequestEntries,
  cancelRequestEntries,
  declineRequestEntries,
} from "@/features/proposal/api/proposalWriteApi";
import { invalidateReviewData } from "@/features/proposal/model/invalidateReviewData";
import { useFamilyAction } from "./useFamilyAction";
import type {
  SpaceInfoDecisionMode,
  SpaceInfoRequestAttempt,
} from "./spaceInfoRequestDecision";

export function useSpaceInfoDecision(spaceId: string, requestId: string) {
  const client = useQueryClient();
  const { accountId } = useSession();
  const action = useFamilyAction<
    SpaceInfoRequestAttempt,
    SpaceInfoDecisionMode
  >(async (attempt) => {
    if (attempt.mode === "apply")
      await applyRequestEntries(spaceId, attempt.body);
    else if (attempt.mode === "decline")
      await declineRequestEntries(spaceId, attempt.body);
    else await cancelRequestEntries(spaceId, requestId, attempt.body);
    return attempt.mode;
  });
  function refresh() {
    // 처리 성공을 먼저 표시한다. 조회 실패가 쓰기 결과를 실패로 바꾸지 않는다.
    void invalidateReviewData(client, accountId, spaceId);
  }
  return {
    ...action,
    submit: (attempt: SpaceInfoRequestAttempt) =>
      action.submit(attempt, refresh),
    retry: () => action.retry(refresh),
  };
}
