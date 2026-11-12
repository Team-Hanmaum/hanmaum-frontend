import {
  isObject,
  isTimestamp,
  isNullableString,
} from "@/lib/api/responseValidators";
import {
  isVersion,
  isNullableVersion,
  isStrings,
} from "@/features/careitem/api/careReadValidators";
import type {
  ProposalApplied,
  ProposalDeclined,
  RequestSubmitted,
  RequestApplied,
  RequestDeclined,
  RequestCanceled,
} from "./proposalWriteTypes";
const isBatch = (v: unknown) => isObject(v) && typeof v.batchId === "string";
export const isProposalApplied = (v: unknown): v is ProposalApplied =>
  isObject(v) &&
  isBatch(v) &&
  isTimestamp(v.appliedAt) &&
  Array.isArray(v.results) &&
  v.results.every(
    (r) =>
      isObject(r) &&
      typeof r.proposalId === "string" &&
      typeof r.itemId === "string" &&
      isVersion(r.itemVersion),
  );
export const isProposalDeclined = (v: unknown): v is ProposalDeclined =>
  isObject(v) &&
  isBatch(v) &&
  isTimestamp(v.decidedAt) &&
  isStrings(v.declinedProposalIds);
export const isRequestSubmitted = (v: unknown): v is RequestSubmitted =>
  isObject(v) &&
  typeof v.requestId === "string" &&
  isTimestamp(v.submittedAt) &&
  Array.isArray(v.entries) &&
  v.entries.every(
    (e) =>
      isObject(e) &&
      typeof e.requestEntryId === "string" &&
      e.status === "PENDING",
  );
export const isRequestApplied = (v: unknown): v is RequestApplied =>
  isObject(v) &&
  isBatch(v) &&
  isTimestamp(v.appliedAt) &&
  Array.isArray(v.results) &&
  v.results.every(
    (r) =>
      isObject(r) &&
      typeof r.requestEntryId === "string" &&
      isNullableString(r.itemId) &&
      isNullableVersion(r.itemVersion) &&
      isNullableVersion(r.spaceVersion),
  );
export const isRequestDeclined = (v: unknown): v is RequestDeclined =>
  isObject(v) &&
  isBatch(v) &&
  isTimestamp(v.decidedAt) &&
  isStrings(v.declinedRequestEntryIds);
export const isRequestCanceled = (v: unknown): v is RequestCanceled =>
  isObject(v) &&
  isBatch(v) &&
  isTimestamp(v.decidedAt) &&
  isStrings(v.canceledRequestEntryIds);
