import { isObject, isCount, isTimestamp } from "@/lib/api/responseValidators";
import type {
  DeletedRecord,
  RecordDeletionImpact,
} from "./recordDeletionTypes";

const nonempty = (value: unknown): value is string =>
  typeof value === "string" && !!value.trim();
const version = (value: unknown) =>
  typeof value === "string" && /^[1-9]\d*$/.test(value);
const ids = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.every(nonempty) &&
  new Set(value).size === value.length;
export function isRecordDeletionImpact(
  value: unknown,
): value is RecordDeletionImpact {
  if (
    !isObject(value) ||
    !nonempty(value.recordId) ||
    !version(value.recordVersion) ||
    !nonempty(value.impactToken) ||
    !isObject(value.counts) ||
    !Array.isArray(value.affectedItems)
  )
    return false;
  const counts = value.counts;
  return (
    ["proposals", "evidence", "items", "historyEntries"].every((key) =>
      isCount(counts[key]),
    ) &&
    value.affectedItems.every(
      (item) =>
        isObject(item) &&
        nonempty(item.itemId) &&
        version(item.itemVersion) &&
        typeof item.hasIndependentEvidence === "boolean" &&
        typeof item.requiresReconfirmation === "boolean",
    ) &&
    new Set(value.affectedItems.map((item) => item.itemId)).size ===
      value.affectedItems.length &&
    counts.items === value.affectedItems.length
  );
}
export function isDeletedRecord(value: unknown): value is DeletedRecord {
  return (
    isObject(value) &&
    nonempty(value.recordId) &&
    isTimestamp(value.deletedAt) &&
    ids(value.affectedItemIds) &&
    ids(value.reconfirmationItemIds) &&
    value.reconfirmationItemIds.every((id) =>
      (value.affectedItemIds as string[]).includes(id),
    )
  );
}
