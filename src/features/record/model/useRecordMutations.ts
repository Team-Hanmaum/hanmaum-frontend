import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import type { ApiError } from "@/lib/api";
import { retryRecordAnalysis } from "../api/recordAnalysisApi";
import type {
  RetriedAnalysis,
  RetryAnalysisRequest,
} from "../api/recordAnalysisTypes";
import { createRecord } from "../api/recordWriteApi";
import type {
  CreateRecordRequest,
  CreatedRecord,
} from "../api/recordWriteTypes";
import { recordKeys } from "./recordKeys";

export function useCreateRecord(spaceId: string) {
  const session = useSession();
  const queryClient = useQueryClient();
  return useMutation<CreatedRecord, ApiError, CreateRecordRequest>({
    mutationKey: ["records", "create", spaceId],
    mutationFn: (request) => createRecord(spaceId, request),
    // 소식 목록과 홈 최근 소식을 함께 갱신한다.
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: recordKeys.space(session.accountId, spaceId),
      }),
  });
}

export function useRetryRecordAnalysis(spaceId: string, recordId: string) {
  const session = useSession();
  const queryClient = useQueryClient();
  return useMutation<RetriedAnalysis, ApiError, RetryAnalysisRequest>({
    mutationKey: ["records", "retry-analysis", spaceId, recordId],
    mutationFn: (request) => retryRecordAnalysis(spaceId, recordId, request),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: recordKeys.space(session.accountId, spaceId),
      }),
  });
}
