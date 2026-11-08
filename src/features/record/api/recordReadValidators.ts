import {
  isObject,
  isNullableString,
  isTimestamp,
} from "@/lib/api/responseValidators";
import type { RecordListResponse } from "./recordReadTypes";

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
