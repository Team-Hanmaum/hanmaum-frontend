export interface RecordSummary {
  recordId: string;
  content: string;
  recordedAt: string;
  isMine: boolean;
  author: {
    membershipId: string | null;
    displayName: string | null;
    withdrawn: boolean;
  };
  latestAnalysis: {
    analysisId: string;
    status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "DISCARDED";
  } | null;
}
export interface RecordListResponse {
  items: RecordSummary[];
  nextCursor: string | null;
  hasNext: boolean;
}
