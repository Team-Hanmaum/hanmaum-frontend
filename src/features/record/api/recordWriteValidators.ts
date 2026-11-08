import { isObject, isTimestamp } from "@/lib/api/responseValidators";
import { isRecordAnalysisState, isRecordVersion } from "./recordReadValidators";
import type { CreatedRecord } from "./recordWriteTypes";

export function isCreatedRecord(value: unknown): value is CreatedRecord {
  return (
    isObject(value) &&
    typeof value.recordId === "string" &&
    isRecordVersion(value.version) &&
    isTimestamp(value.recordedAt) &&
    isObject(value.analysis) &&
    typeof value.analysis.analysisId === "string" &&
    isRecordAnalysisState(value.analysis.status)
  );
}
