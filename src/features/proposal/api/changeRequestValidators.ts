import {
  isObject,
  isTimestamp,
  isNullableString,
  isCount,
} from "@/lib/api/responseValidators";
import {
  isAuthor,
  isNullableVersion,
  isValues,
  isStrings,
} from "@/features/careitem/api/careReadValidators";
import { isProposalAction, isProposalDecision } from "./proposalReadValidators";
import type {
  RequestStatus,
  RequestEntrySummary,
  ChangeRequestSummary,
  ChangeRequestDetail,
  ChangeRequestPage,
  ChangeRequestEntry,
} from "./changeRequestTypes";
export const isRequestStatus = (v: unknown): v is RequestStatus =>
  typeof v === "string" &&
  ["PENDING", "APPLIED", "DECLINED", "CANCELED", "INVALIDATED"].includes(v);
const isEntry = (v: unknown): v is RequestEntrySummary =>
  isObject(v) &&
  typeof v.requestEntryId === "string" &&
  typeof v.sourceType === "string" &&
  isProposalAction(v.action) &&
  isNullableString(v.targetItemId) &&
  isRequestStatus(v.status) &&
  isNullableString(v.invalidReason);
const isSummary = (v: unknown): v is ChangeRequestSummary =>
  isObject(v) &&
  typeof v.requestId === "string" &&
  isAuthor(v.submittedBy) &&
  isTimestamp(v.submittedAt) &&
  isObject(v.counts) &&
  ["pending", "applied", "declined", "canceled", "invalidated"].every(
    (k) => isObject(v.counts) && isCount(v.counts[k]),
  ) &&
  Array.isArray(v.entries) &&
  v.entries.every(isEntry);
const isDetailEntry = (v: unknown): v is ChangeRequestEntry =>
  isObject(v) &&
  isNullableString(v.proposalId) &&
  isNullableVersion(v.expectedItemVersion) &&
  isNullableVersion(v.currentItemVersion) &&
  isNullableVersion(v.expectedSpaceVersion) &&
  isNullableVersion(v.currentSpaceVersion) &&
  isValues(v.requestedValues) &&
  isValues(v.currentValues) &&
  isStrings(v.evidenceIds) &&
  isNullableString(v.reviewToken) &&
  isStrings(v.redactedFields) &&
  (v.decision === null ||
    (isObject(v.decision) &&
      isNullableString(v.decision.decidedByMembershipId) &&
      isNullableVersion(v.decision.spaceVersion) &&
      isProposalDecision(v.decision))) &&
  isEntry(v);
export const isChangeRequestPage = (v: unknown): v is ChangeRequestPage =>
  isObject(v) &&
  Array.isArray(v.items) &&
  v.items.every(isSummary) &&
  isNullableString(v.nextCursor) &&
  typeof v.hasNext === "boolean";
export const isChangeRequestDetail = (v: unknown): v is ChangeRequestDetail =>
  isObject(v) &&
  Array.isArray(v.entries) &&
  v.entries.every(isDetailEntry) &&
  isSummary(v);
