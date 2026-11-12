import type {
  CareValues,
  SourceAuthor,
} from "@/features/careitem/api/careReadTypes";
import type { ProposalAction, ProposalDecision } from "./proposalReadTypes";
export type RequestStatus =
  "PENDING" | "APPLIED" | "DECLINED" | "CANCELED" | "INVALIDATED";
export type RequestEntrySummary = {
  requestEntryId: string;
  sourceType: "AI_PROPOSAL" | "DIRECT_INPUT";
  action: ProposalAction;
  targetItemId: string | null;
  status: RequestStatus;
  invalidReason: string | null;
};
export type RequestCounts = {
  pending: number;
  applied: number;
  declined: number;
  canceled: number;
  invalidated: number;
};
export type ChangeRequestSummary = {
  requestId: string;
  submittedBy: SourceAuthor;
  submittedAt: string;
  counts: RequestCounts;
  entries: RequestEntrySummary[];
};
export type ChangeRequestEntry = RequestEntrySummary & {
  proposalId: string | null;
  expectedItemVersion: string | null;
  currentItemVersion: string | null;
  expectedSpaceVersion: string | null;
  currentSpaceVersion: string | null;
  requestedValues: CareValues | null;
  currentValues: CareValues | null;
  evidenceIds: string[];
  reviewToken: string | null;
  decision:
    | (ProposalDecision & {
        decidedByMembershipId: string | null;
        spaceVersion: string | null;
      })
    | null;
  redactedFields: string[];
};
export type ChangeRequestDetail = Omit<ChangeRequestSummary, "entries"> & {
  entries: ChangeRequestEntry[];
};
export type ChangeRequestPage = {
  items: ChangeRequestSummary[];
  nextCursor: string | null;
  hasNext: boolean;
};
