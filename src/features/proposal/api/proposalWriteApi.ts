import { readApiData } from "@/lib/api/responseData";
import type {
  ProposalApplicationBody,
  ProposalDeclineBody,
  RequestSubmissionBody,
  RequestApplicationBody,
  RequestDecisionBody,
  RequestCancellationBody,
  ProposalApplied,
  ProposalDeclined,
  RequestSubmitted,
  RequestApplied,
  RequestDeclined,
  RequestCanceled,
} from "./proposalWriteTypes";
import {
  isProposalApplied,
  isProposalDeclined,
  isRequestSubmitted,
  isRequestApplied,
  isRequestDeclined,
  isRequestCanceled,
} from "./proposalWriteValidators";
const base = (space: string) =>
  `/api/spaces/${encodeURIComponent(space)}` as const;
const sameIds = (actual: string[], expected: string[]) =>
  actual.length === expected.length &&
  new Set(actual).size === actual.length &&
  expected.every((id) => actual.includes(id));
export const applyProposals = (space: string, body: ProposalApplicationBody) =>
  readApiData(
    `${base(space)}/proposal-applications`,
    (value): value is ProposalApplied =>
      isProposalApplied(value) &&
      sameIds(
        value.results.map((r) => r.proposalId),
        body.entries.map((e) => e.proposalId),
      ),
    {
      method: "POST",
      body,
    },
  );
export const declineProposals = (space: string, body: ProposalDeclineBody) =>
  readApiData(
    `${base(space)}/proposal-declines`,
    (value): value is ProposalDeclined =>
      isProposalDeclined(value) &&
      sameIds(
        value.declinedProposalIds,
        body.entries.map((e) => e.proposalId),
      ),
    {
      method: "POST",
      body,
    },
  );
export const submitProposalRequest = (
  space: string,
  body: RequestSubmissionBody,
) =>
  readApiData(
    `${base(space)}/change-requests`,
    (value): value is RequestSubmitted =>
      isRequestSubmitted(value) &&
      value.entries.length === body.entries.length &&
      new Set(value.entries.map((e) => e.requestEntryId)).size ===
        body.entries.length,
    {
      method: "POST",
      expectedStatus: 201,
      body,
    },
  );
export const applyRequestEntries = (
  space: string,
  body: RequestApplicationBody,
) =>
  readApiData(
    `${base(space)}/request-applications`,
    (value): value is RequestApplied =>
      isRequestApplied(value) &&
      sameIds(
        value.results.map((r) => r.requestEntryId),
        body.entries.map((e) => e.requestEntryId),
      ),
    {
      method: "POST",
      body,
    },
  );
export const declineRequestEntries = (
  space: string,
  body: RequestDecisionBody,
) =>
  readApiData(
    `${base(space)}/request-declines`,
    (value): value is RequestDeclined =>
      isRequestDeclined(value) &&
      sameIds(
        value.declinedRequestEntryIds,
        body.entries.map((e) => e.requestEntryId),
      ),
    {
      method: "POST",
      body,
    },
  );
export const cancelRequestEntries = (
  space: string,
  request: string,
  body: RequestCancellationBody,
) =>
  readApiData(
    `${base(space)}/change-requests/${encodeURIComponent(request)}/cancellations`,
    (value): value is RequestCanceled =>
      isRequestCanceled(value) &&
      sameIds(
        value.canceledRequestEntryIds,
        body.entries.map((e) => e.requestEntryId),
      ),
    { method: "POST", body },
  );
