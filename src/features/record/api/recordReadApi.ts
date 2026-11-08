import {
  isObject,
  isNullableString,
  isTimestamp,
  readApiData,
} from "@/lib/api/responseData";

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
export function isRecordList(value: unknown): value is RecordListResponse {
  return (
    isObject(value) &&
    isNullableString(value.nextCursor) &&
    typeof value.hasNext === "boolean" &&
    Array.isArray(value.items) &&
    value.items.every(
      (item: unknown) =>
        isObject(item) &&
        typeof item.recordId === "string" &&
        typeof item.content === "string" &&
        isTimestamp(item.recordedAt) &&
        typeof item.isMine === "boolean" &&
        isObject(item.author) &&
        isNullableString(item.author.membershipId) &&
        isNullableString(item.author.displayName) &&
        typeof item.author.withdrawn === "boolean" &&
        (item.latestAnalysis === null ||
          (isObject(item.latestAnalysis) &&
            typeof item.latestAnalysis.analysisId === "string" &&
            ["QUEUED", "RUNNING", "COMPLETED", "FAILED", "DISCARDED"].includes(
              String(item.latestAnalysis.status),
            ))),
    )
  );
}
export function getRecentRecords(
  spaceId: string,
  size: number,
  signal?: AbortSignal,
) {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}/source-records`,
    isRecordList,
    { params: { size }, signal },
  );
}
