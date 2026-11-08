import {
  isObject,
  isNullableString,
  isTimestamp,
} from "@/lib/api/responseValidators";
import type {
  RecordAnalysisState,
  RecordDetail,
  RecordListResponse,
  RecordSummary,
} from "./recordReadTypes";

const analysisStates: readonly RecordAnalysisState[] = [
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "DISCARDED",
];
export const isRecordAnalysisState = (
  value: unknown,
): value is RecordAnalysisState =>
  analysisStates.includes(value as RecordAnalysisState);
export const isRecordVersion = (value: unknown): value is string =>
  typeof value === "string" && /^[1-9]\d*$/.test(value);

function isRecordSummary(item: unknown): item is RecordSummary {
  return (
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
        isRecordAnalysisState(item.latestAnalysis.status)))
  );
}

export function isRecordList(value: unknown): value is RecordListResponse {
  return (
    isObject(value) &&
    isNullableString(value.nextCursor) &&
    typeof value.hasNext === "boolean" &&
    Array.isArray(value.items) &&
    value.items.every(isRecordSummary)
  );
}

export function isRecordDetail(value: unknown): value is RecordDetail {
  return (
    isRecordSummary(value) &&
    isObject(value) &&
    typeof value.spaceId === "string" &&
    isRecordVersion(value.version) &&
    Array.isArray(value.proposalIds) &&
    value.proposalIds.every((id: unknown) => typeof id === "string") &&
    typeof value.canDelete === "boolean"
  );
}
