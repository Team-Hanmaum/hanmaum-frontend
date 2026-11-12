import {
  isObject,
  isNullableString,
  isTimestamp,
} from "@/lib/api/responseValidators";
import {
  isAuthor,
  isItemType,
  isNullableVersion,
  isStrings,
  isValues,
  isVersion,
} from "@/features/careitem/api/careReadValidators";
import type {
  ProposalAction,
  ProposalStatus,
  ProposalSummary,
  ProposalPage,
  ProposalDetail,
  ProposalDecision,
} from "./proposalReadTypes";
export const isProposalAction = (v: unknown): v is ProposalAction =>
  typeof v === "string" &&
  [
    "CREATE_ITEM",
    "UPDATE_ITEM",
    "DELETE_ITEM",
    "UPDATE_SPACE",
    "RESOLVE_QUESTION",
    "LINK_EVIDENCE",
  ].includes(v);
export const isProposalStatus = (v: unknown): v is ProposalStatus =>
  typeof v === "string" &&
  ["REVIEW_PENDING", "APPLIED", "DECLINED", "INVALIDATED"].includes(v);
export const isProposalDecision = (v: unknown): v is ProposalDecision =>
  isObject(v) &&
  typeof v.batchId === "string" &&
  isTimestamp(v.decidedAt) &&
  isNullableString(v.itemId) &&
  isNullableVersion(v.itemVersion) &&
  isValues(v.appliedValues);
export const isProposalSummary = (v: unknown): v is ProposalSummary =>
  isObject(v) &&
  typeof v.proposalId === "string" &&
  typeof v.recordId === "string" &&
  typeof v.analysisId === "string" &&
  isItemType(v.itemType) &&
  isProposalAction(v.action) &&
  isProposalStatus(v.status) &&
  isNullableString(v.title) &&
  isNullableString(v.targetItemId) &&
  (v.needsConflictReview === null ||
    typeof v.needsConflictReview === "boolean") &&
  isTimestamp(v.createdAt);
export const isProposalPage = (v: unknown): v is ProposalPage =>
  isObject(v) &&
  Array.isArray(v.items) &&
  v.items.every(isProposalSummary) &&
  isNullableString(v.nextCursor) &&
  typeof v.hasNext === "boolean";
export const isProposalDetail = (v: unknown): v is ProposalDetail =>
  isObject(v) &&
  typeof v.spaceId === "string" &&
  isNullableVersion(v.analysisTargetVersion) &&
  isNullableVersion(v.currentItemVersion) &&
  isValues(v.currentValues) &&
  isValues(v.proposedValues) &&
  Array.isArray(v.candidates) &&
  v.candidates.every(
    (c) =>
      isObject(c) &&
      typeof c.itemId === "string" &&
      isVersion(c.version) &&
      isNullableString(c.title),
  ) &&
  Array.isArray(v.evidence) &&
  v.evidence.every(
    (e) =>
      isObject(e) &&
      typeof e.evidenceId === "string" &&
      typeof e.recordId === "string" &&
      typeof e.quote === "string" &&
      typeof e.valid === "boolean" &&
      isAuthor(e.author) &&
      isTimestamp(e.recordedAt),
  ) &&
  isNullableString(v.relationKind) &&
  isNullableString(v.reviewToken) &&
  isStrings(v.redactedFields) &&
  isStrings(v.changedFields) &&
  isStrings(v.clearFields) &&
  isStrings(v.reviewReasons) &&
  Array.isArray(v.comparisonBasis) &&
  v.comparisonBasis.every(
    (b) =>
      isObject(b) &&
      typeof b.basisId === "string" &&
      typeof b.itemId === "string" &&
      typeof b.kind === "string" &&
      isNullableString(b.recordId) &&
      isNullableString(b.text),
  ) &&
  (v.decision === null || isProposalDecision(v.decision)) &&
  isProposalSummary(v);
