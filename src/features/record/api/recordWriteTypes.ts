import type { RecordLatestAnalysis } from "./recordReadTypes";

// POST /source-records. 한 작성 시도의 재전송에는 같은 clientRequestId와 원문을 유지한다.
export interface CreateRecordRequest {
  content: string;
  clientRequestId: string;
}
export interface CreatedRecord {
  recordId: string;
  version: string;
  recordedAt: string;
  analysis: RecordLatestAnalysis | null;
}
