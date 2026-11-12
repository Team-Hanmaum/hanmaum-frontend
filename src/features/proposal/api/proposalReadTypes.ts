import type {
  ItemType,
  SourceAuthor,
  CareValues,
} from "@/features/careitem/api/careReadTypes";
export type ProposalStatus =
  "REVIEW_PENDING" | "APPLIED" | "DECLINED" | "INVALIDATED";
export type ProposalAction =
  | "CREATE_ITEM"
  | "UPDATE_ITEM"
  | "DELETE_ITEM"
  | "UPDATE_SPACE"
  | "RESOLVE_QUESTION"
  | "LINK_EVIDENCE";
export type ProposalSummary = {
  proposalId: string;
  recordId: string;
  analysisId: string;
  itemType: ItemType;
  action: ProposalAction;
  status: ProposalStatus;
  title: string | null;
  targetItemId: string | null;
  needsConflictReview: boolean | null;
  createdAt: string;
};
export type ProposalPage = {
  items: ProposalSummary[];
  nextCursor: string | null;
  hasNext: boolean;
};
export type ProposalDecision = {
  batchId: string;
  decidedAt: string;
  itemId: string | null;
  itemVersion: string | null;
  appliedValues: CareValues | null;
};
export type ProposalDetail = ProposalSummary & {
  spaceId: string;
  analysisTargetVersion: string | null;
  currentItemVersion: string | null;
  currentValues: CareValues | null;
  proposedValues: CareValues | null;
  candidates: { itemId: string; version: string; title: string | null }[];
  evidence: {
    evidenceId: string;
    recordId: string;
    quote: string;
    valid: boolean;
    author: SourceAuthor;
    recordedAt: string;
  }[];
  relationKind: string | null;
  reviewToken: string | null;
  redactedFields: string[];
  changedFields: string[];
  clearFields: string[];
  reviewReasons: string[];
  comparisonBasis: {
    basisId: string;
    itemId: string;
    kind: string;
    recordId: string | null;
    text: string | null;
  }[];
  decision: ProposalDecision | null;
};
