import {
  isObject,
  isNullableString,
  isCount,
  isTimestamp,
} from "@/lib/api/responseValidators";
import type {
  ItemType,
  SourceAuthor,
  CareSummary,
  CareDetail,
  CareListResponse,
  CareEvidence,
  CareHistoryEntry,
  CareHistoryDetail,
} from "./careReadTypes";
export const isVersion = (v: unknown): v is string =>
  typeof v === "string" && /^[1-9]\d*$/.test(v);
export const isNullableVersion = (v: unknown): v is string | null =>
  v === null || isVersion(v);
export const isStrings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");
export const isValues = (v: unknown): v is Record<string, unknown> | null =>
  v === null || isObject(v);
export const isItemType = (v: unknown): v is ItemType =>
  typeof v === "string" &&
  ["SCHEDULE", "TASK", "QUESTION", "OBSERVATION", "GUIDANCE"].includes(v);
export const isAuthor = (v: unknown): v is SourceAuthor =>
  isObject(v) &&
  isNullableString(v.membershipId) &&
  isNullableString(v.displayName) &&
  typeof v.withdrawn === "boolean";
function isCareBase(v: unknown) {
  return (
    isObject(v) &&
    typeof v.itemId === "string" &&
    isItemType(v.itemType) &&
    isVersion(v.version) &&
    isNullableString(v.title) &&
    isNullableString(v.status) &&
    typeof v.needsReconfirmation === "boolean" &&
    typeof v.needsConflictReview === "boolean" &&
    isValues(v.fields)
  );
}
export const isCareSummary = (v: unknown): v is CareSummary =>
  isObject(v) && isCareBase(v) && isNullableString(v.assigneeDisplayName);
export const isCareList = (v: unknown): v is CareListResponse =>
  isObject(v) &&
  Array.isArray(v.items) &&
  v.items.every(isCareSummary) &&
  isCount(v.totalCount) &&
  Array.isArray(v.reconfirmationItems) &&
  v.reconfirmationItems.every(isCareSummary) &&
  (v.pastScheduleCount === undefined ||
    v.pastScheduleCount === null ||
    isCount(v.pastScheduleCount));
export const isCareDetail = (v: unknown): v is CareDetail =>
  isObject(v) &&
  isCareBase(v) &&
  typeof v.spaceId === "string" &&
  isNullableString(v.description) &&
  typeof v.visibility === "string" &&
  isStrings(v.redactedFields) &&
  (v.editLock === null ||
    (isObject(v.editLock) &&
      typeof v.editLock.holderMembershipId === "string" &&
      isTimestamp(v.editLock.expiresAt) &&
      typeof v.editLock.mine === "boolean")) &&
  Array.isArray(v.answers) &&
  v.answers.every(
    (a) =>
      isObject(a) &&
      typeof a.answerId === "string" &&
      isNullableString(a.requestEntryId) &&
      isNullableString(a.answer) &&
      isNullableString(a.basis) &&
      isNullableString(a.submittedByMembershipId) &&
      isTimestamp(a.submittedAt) &&
      typeof a.status === "string",
  ) &&
  isNullableString(v.confirmedAnswer) &&
  isTimestamp(v.createdAt) &&
  isTimestamp(v.updatedAt);
export const isCareEvidence = (v: unknown): v is CareEvidence =>
  isObject(v) &&
  typeof v.evidenceId === "string" &&
  typeof v.kind === "string" &&
  ["RECORD_QUOTE", "DIRECT_INPUT", "DERIVED"].includes(v.kind) &&
  typeof v.status === "string" &&
  ["VALID", "REDACTED"].includes(v.status) &&
  isNullableString(v.recordId) &&
  isNullableString(v.text) &&
  isNullableString(v.createdByMembershipId) &&
  (v.createdAt === null || isTimestamp(v.createdAt)) &&
  isStrings(v.fieldPaths);
export const isCareHistoryEntry = (v: unknown): v is CareHistoryEntry =>
  isObject(v) &&
  isVersion(v.version) &&
  typeof v.changeKind === "string" &&
  isAuthor(v.changedBy) &&
  isTimestamp(v.changedAt) &&
  isStrings(v.redactedFields);
export const isCareHistoryDetail = (v: unknown): v is CareHistoryDetail =>
  isObject(v) &&
  typeof v.itemId === "string" &&
  isVersion(v.version) &&
  isNullableVersion(v.previousVersion) &&
  isValues(v.before) &&
  isValues(v.after) &&
  isAuthor(v.changedBy) &&
  isTimestamp(v.changedAt) &&
  isStrings(v.evidenceIds) &&
  isStrings(v.redactedFields);
