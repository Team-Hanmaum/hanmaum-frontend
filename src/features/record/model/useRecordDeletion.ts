import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import type { ApiError } from "@/lib/api";
import {
  deleteRecord,
  getRecordDeletionImpact,
} from "../api/recordDeletionApi";
import type {
  DeleteRecordBody,
  DeletedRecord,
} from "../api/recordDeletionTypes";
import { recordKeys } from "./recordKeys";
import { resetDeletedRecordData } from "./resetDeletedRecordData";
import { canRetryReview } from "@/features/proposal/model/reviewFailure";

const resultKey = (
  account: string | undefined,
  space: string,
  record: string,
) => ["record-deletions", account, space, record] as const;
export function useRecordDeletionImpact(space: string, record: string) {
  const session = useSession();
  return useQuery({
    queryKey: [
      ...recordKeys.space(session.accountId, space),
      "deletion-impact",
      record,
    ],
    queryFn: ({ signal }) => getRecordDeletionImpact(space, record, signal),
    enabled: session.status === "authenticated" && !!record,
    staleTime: 0,
  });
}
export function useDeleteRecord(space: string, record: string) {
  const session = useSession();
  const client = useQueryClient();
  return useMutation<DeletedRecord, ApiError, DeleteRecordBody>({
    mutationFn: (body) => deleteRecord(space, record, body),
    retry: false,
    onError: async (error) => {
      // 응답 유실도 삭제 완료 가능성이 있다. 원문과 파생 값을 그대로 재노출하지 않는다.
      if (canRetryReview(error) || error.status === 403 || error.status === 404)
        await resetDeletedRecordData(client, session.accountId, space);
    },
    onSuccess: async (result) => {
      await resetDeletedRecordData(client, session.accountId, space);
      // 삭제 결과에는 원문이나 제목을 넣지 않는다. 새로고침/세션 종료 시 소멸한다.
      client.setQueryData(resultKey(session.accountId, space, record), result);
    },
  });
}
export function useRecordDeletionResult(space: string, record: string) {
  const session = useSession();
  return useQuery<DeletedRecord>({
    queryKey: resultKey(session.accountId, space, record),
    queryFn: skipToken,
    staleTime: Infinity,
  });
}
