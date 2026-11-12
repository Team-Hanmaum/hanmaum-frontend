export type ItemType =
  "SCHEDULE" | "TASK" | "QUESTION" | "OBSERVATION" | "GUIDANCE";
export type SourceAuthor = {
  membershipId: string | null;
  displayName: string | null;
  withdrawn: boolean;
};
export type CareValues = Record<string, unknown>;
export type CareSummary = {
  itemId: string;
  itemType: ItemType;
  version: string;
  title: string | null;
  status: string | null;
  needsReconfirmation: boolean;
  needsConflictReview: boolean;
  fields: CareValues | null;
  assigneeDisplayName: string | null;
};
export type CareListResponse = {
  items: CareSummary[];
  totalCount: number;
  reconfirmationItems: CareSummary[];
  pastScheduleCount?: number | null;
};
export type CareDetail = Omit<CareSummary, "assigneeDisplayName"> & {
  spaceId: string;
  description: string | null;
  visibility: string;
  redactedFields: string[];
  editLock: {
    holderMembershipId: string;
    expiresAt: string;
    mine: boolean;
  } | null;
  answers: {
    answerId: string;
    requestEntryId: string | null;
    answer: string | null;
    basis: string | null;
    submittedByMembershipId: string | null;
    submittedAt: string;
    status: string;
  }[];
  confirmedAnswer: string | null;
  createdAt: string;
  updatedAt: string;
};
export type CareEvidence = {
  evidenceId: string;
  kind: "RECORD_QUOTE" | "DIRECT_INPUT" | "DERIVED";
  status: "VALID" | "REDACTED";
  recordId: string | null;
  text: string | null;
  createdByMembershipId: string | null;
  createdAt: string | null;
  fieldPaths: string[];
};
export type CareHistoryEntry = {
  version: string;
  changeKind: string;
  changedBy: SourceAuthor;
  changedAt: string;
  redactedFields: string[];
};
export type CareHistoryDetail = {
  itemId: string;
  version: string;
  previousVersion: string | null;
  before: CareValues | null;
  after: CareValues | null;
  changedBy: SourceAuthor;
  changedAt: string;
  evidenceIds: string[];
  redactedFields: string[];
};
