import { useEffect } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import type { ApiError } from "@/lib/api";
import { getRecordAnalysis } from "../api/recordAnalysisApi";
import type { RecordAnalysis } from "../api/recordAnalysisTypes";
import { getRecordDetail, getRecordPage } from "../api/recordReadApi";
import type {
  RecordAnalysisState,
  RecordDetail,
  RecordListResponse,
} from "../api/recordReadTypes";
import { recordKeys } from "./recordKeys";

export const recordPageSize = 20;
// 분석 대기·진행 중에만 상태를 다시 확인한다. 완료·실패·폐기는 사용자 동작이 있을 때 갱신한다.
export const analysisPollInterval = 3000;
export const isAnalysisInProgress = (status?: RecordAnalysisState | null) =>
  status === "QUEUED" || status === "RUNNING";

export function useRecordList(spaceId: string) {
  const session = useSession();
  return useInfiniteQuery<
    RecordListResponse,
    ApiError,
    { pages: RecordListResponse[] },
    ReturnType<typeof recordKeys.list>,
    string | null
  >({
    queryKey: recordKeys.list(session.accountId, spaceId),
    queryFn: ({ pageParam, signal }) =>
      getRecordPage(
        spaceId,
        { cursor: pageParam, size: recordPageSize },
        signal,
      ),
    initialPageParam: null,
    getNextPageParam: (last) =>
      last.hasNext && last.nextCursor ? last.nextCursor : undefined,
    enabled: session.status === "authenticated",
  });
}

export function useRecordDetail(spaceId: string, recordId: string) {
  const session = useSession();
  return useQuery<RecordDetail, ApiError>({
    queryKey: recordKeys.detail(session.accountId, spaceId, recordId),
    queryFn: ({ signal }) => getRecordDetail(spaceId, recordId, signal),
    enabled: session.status === "authenticated" && Boolean(recordId),
  });
}

// 최신 분석 실행의 상태를 조회하고, 종료되면 상세·목록·홈 소식을 다시 불러온다.
export function useRecordAnalysis(
  spaceId: string,
  recordId: string,
  latest: RecordDetail["latestAnalysis"] | undefined,
) {
  const session = useSession();
  const queryClient = useQueryClient();
  const analysisId = latest?.analysisId ?? "";
  const query = useQuery<RecordAnalysis, ApiError>({
    queryKey: recordKeys.analysis(
      session.accountId,
      spaceId,
      recordId,
      analysisId,
    ),
    queryFn: ({ signal }) =>
      getRecordAnalysis(spaceId, recordId, analysisId, signal),
    enabled:
      session.status === "authenticated" &&
      Boolean(analysisId) &&
      latest?.status !== "DISCARDED",
    // 조회가 실패하면 자동 재조회를 멈추고 화면의 다시 확인 동작으로만 재시도한다.
    refetchInterval: (current) =>
      current.state.status !== "error" &&
      isAnalysisInProgress(current.state.data?.status ?? latest?.status)
        ? analysisPollInterval
        : false,
  });
  const current = query.data?.status;
  const stale =
    Boolean(current) &&
    isAnalysisInProgress(latest?.status) &&
    !isAnalysisInProgress(current);
  useEffect(() => {
    if (stale)
      void queryClient.invalidateQueries({
        queryKey: recordKeys.space(session.accountId, spaceId),
      });
  }, [stale, queryClient, session.accountId, spaceId]);
  return query;
}
