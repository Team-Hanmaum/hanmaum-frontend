export type RecordAnalysisState =
  "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "DISCARDED";
export interface RecordAuthor {
  membershipId: string | null;
  displayName: string | null;
  withdrawn: boolean;
}
export interface RecordLatestAnalysis {
  analysisId: string;
  status: RecordAnalysisState;
}
export interface RecordSummary {
  recordId: string;
  content: string;
  recordedAt: string;
  isMine: boolean;
  author: RecordAuthor;
  latestAnalysis: RecordLatestAnalysis | null;
}
export interface RecordListResponse {
  items: RecordSummary[];
  nextCursor: string | null;
  hasNext: boolean;
}
export interface RecordListQuery {
  cursor?: string | null;
  size: number;
}
// GET /source-records/{recordId}: 버전은 분석 재시도의 expectedRecordVersion으로 사용한다.
export interface RecordDetail extends RecordSummary {
  spaceId: string;
  version: string;
  proposalIds: string[];
  canDelete: boolean;
}
