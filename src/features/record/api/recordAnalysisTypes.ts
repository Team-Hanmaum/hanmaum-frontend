import type { RecordAnalysisState } from "./recordReadTypes";

// GET /source-records/{recordId}/analyses/{analysisId}
export interface RecordAnalysis {
  analysisId: string;
  recordId: string;
  status: RecordAnalysisState;
  proposalIds: string[];
  failure: { code: string; message: string } | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  canRetry: boolean;
}
// POST /source-records/{recordId}/analyses: 최신 FAILED 실행만 다시 접수한다.
export interface RetryAnalysisRequest {
  failedAnalysisId: string;
  expectedRecordVersion: string;
  clientRequestId: string;
}
export interface RetriedAnalysis {
  recordId: string;
  analysisId: string;
  status: RecordAnalysisState;
}
