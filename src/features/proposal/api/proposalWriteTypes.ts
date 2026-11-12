import type { CareValues } from "@/features/careitem/api/careReadTypes";
import type { ProposalAction } from "./proposalReadTypes";
export type ProposalApplicationEntry = {
  proposalId: string;
  action: ProposalAction;
  reviewToken: string;
  targetItemId?: string;
  expectedItemVersion?: string;
  leaseToken?: string;
  values?: CareValues | null;
};
export type ProposalApplicationBody = {
  clientRequestId: string;
  entries: ProposalApplicationEntry[];
};
export type ProposalDeclineBody = {
  clientRequestId: string;
  entries: { proposalId: string; reviewToken: string }[];
};
export type ProposalApplied = {
  batchId: string;
  appliedAt: string;
  results: { proposalId: string; itemId: string; itemVersion: string }[];
};
export type ProposalDeclined = {
  batchId: string;
  decidedAt: string;
  declinedProposalIds: string[];
};
export type RequestSubmissionBody = {
  clientRequestId: string;
  entries: (ProposalApplicationEntry & { sourceType: "AI_PROPOSAL" })[];
};
export type RequestSubmitted = {
  requestId: string;
  submittedAt: string;
  entries: { requestEntryId: string; status: "PENDING" }[];
};
export type RequestApplicationBody = {
  clientRequestId: string;
  entries: {
    requestEntryId: string;
    reviewToken: string;
    expectedItemVersion?: string;
    expectedSpaceVersion?: string;
    leaseToken?: string;
    values?: CareValues | null;
  }[];
};
export type RequestDecisionBody = {
  clientRequestId: string;
  entries: { requestEntryId: string; reviewToken: string }[];
};
export type RequestCancellationBody = {
  clientRequestId: string;
  entries: { requestEntryId: string }[];
};
export type RequestApplied = {
  batchId: string;
  appliedAt: string;
  results: {
    requestEntryId: string;
    itemId: string | null;
    itemVersion: string | null;
    spaceVersion: string | null;
  }[];
};
export type RequestDeclined = {
  batchId: string;
  decidedAt: string;
  declinedRequestEntryIds: string[];
};
export type RequestCanceled = {
  batchId: string;
  decidedAt: string;
  canceledRequestEntryIds: string[];
};
