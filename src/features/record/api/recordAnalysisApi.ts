import { readApiData } from "@/lib/api/responseData";
import type {
  RecordAnalysis,
  RetriedAnalysis,
  RetryAnalysisRequest,
} from "./recordAnalysisTypes";
import {
  isRecordAnalysis,
  isRetriedAnalysis,
} from "./recordAnalysisValidators";

const analysesPath = (spaceId: string, recordId: string) =>
  `/api/spaces/${encodeURIComponent(spaceId)}/source-records/${encodeURIComponent(recordId)}/analyses` as const;

export function getRecordAnalysis(
  spaceId: string,
  recordId: string,
  analysisId: string,
  signal?: AbortSignal,
): Promise<RecordAnalysis> {
  return readApiData(
    `${analysesPath(spaceId, recordId)}/${encodeURIComponent(analysisId)}`,
    (value): value is RecordAnalysis =>
      isRecordAnalysis(value) &&
      value.recordId === recordId &&
      value.analysisId === analysisId,
    { signal },
  );
}

// 202 ACCEPTED는 재분석 접수이며 분석 완료를 뜻하지 않는다.
export function retryRecordAnalysis(
  spaceId: string,
  recordId: string,
  request: RetryAnalysisRequest,
  signal?: AbortSignal,
): Promise<RetriedAnalysis> {
  return readApiData(
    analysesPath(spaceId, recordId),
    (value): value is RetriedAnalysis =>
      isRetriedAnalysis(value) && value.recordId === recordId,
    { method: "POST", expectedStatus: 202, body: request, signal },
  );
}
