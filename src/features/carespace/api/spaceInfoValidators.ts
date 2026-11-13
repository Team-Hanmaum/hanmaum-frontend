import { isObject, isTimestamp } from "@/lib/api/responseValidators";
import type { UpdateSpaceInfoResult } from "./spaceInfoTypes";

export function isUpdateSpaceInfoResult(
  value: unknown,
): value is UpdateSpaceInfoResult {
  return (
    isObject(value) &&
    typeof value.spaceId === "string" &&
    !!value.spaceId.trim() &&
    typeof value.subjectLabel === "string" &&
    !!value.subjectLabel.trim() &&
    typeof value.version === "string" &&
    /^[1-9]\d{0,18}$/.test(value.version) &&
    BigInt(value.version) <= 9223372036854775807n &&
    isTimestamp(value.updatedAt)
  );
}
