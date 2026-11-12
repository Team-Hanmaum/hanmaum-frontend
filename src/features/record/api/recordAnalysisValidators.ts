import { isObject, isTimestamp } from "@/lib/api/responseValidators";
import { isRecordAnalysisState } from "./recordReadValidators";
import type { RecordAnalysis, RetriedAnalysis } from "./recordAnalysisTypes";

const isNullableTimestamp = (value: unknown) =>
  value === null || isTimestamp(value);

export function isRecordAnalysis(value: unknown): value is RecordAnalysis {
  return (
    isObject(value) &&
    typeof value.analysisId === "string" &&
    typeof value.recordId === "string" &&
    isRecordAnalysisState(value.status) &&
    Array.isArray(value.proposalIds) &&
    value.proposalIds.every((id: unknown) => typeof id === "string") &&
    (value.failure === null ||
      (isObject(value.failure) &&
        typeof value.failure.code === "string" &&
        typeof value.failure.message === "string")) &&
    isTimestamp(value.createdAt) &&
    isNullableTimestamp(value.startedAt) &&
    isNullableTimestamp(value.finishedAt) &&
    typeof value.canRetry === "boolean"
  );
}

export function isRetriedAnalysis(value: unknown): value is RetriedAnalysis {
  return (
    isObject(value) &&
    typeof value.recordId === "string" &&
    typeof value.analysisId === "string" &&
    isRecordAnalysisState(value.status)
  );
}
