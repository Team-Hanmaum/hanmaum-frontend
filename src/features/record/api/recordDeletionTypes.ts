export type RecordDeletionImpact = {
  recordId: string;
  recordVersion: string;
  impactToken: string;
  counts: {
    proposals: number;
    evidence: number;
    items: number;
    historyEntries: number;
  };
  affectedItems: {
    itemId: string;
    itemVersion: string;
    hasIndependentEvidence: boolean;
    requiresReconfirmation: boolean;
  }[];
};
export type DeleteRecordBody = {
  expectedRecordVersion: string;
  impactToken: string;
  clientRequestId: string;
};
export type DeletedRecord = {
  recordId: string;
  deletedAt: string;
  affectedItemIds: string[];
  reconfirmationItemIds: string[];
};
