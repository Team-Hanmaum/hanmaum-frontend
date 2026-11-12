export type MembershipChangeBody = {
  expectedSpaceVersion: string;
  clientRequestId: string;
};

export type RemoveSpaceMemberResult = {
  membershipId: string;
  endedAt: string;
  spaceVersion: string;
};

export type LeaveCareSpaceResult = {
  membershipId: string;
  endedAt: string;
};

export type TransferSpaceOwnershipBody = MembershipChangeBody & {
  targetMembershipId: string;
};

export type TransferSpaceOwnershipResult = {
  spaceId: string;
  ownerMembershipId: string;
  myRole: "MEMBER";
  spaceVersion: string;
};

export type SpaceDeletionImpact = {
  spaceId: string;
  spaceVersion: string;
  counts: {
    members: number;
    records: number;
    items: number;
    proposals: number;
    requests: number;
    historyEntries: number;
  };
  impactToken: string;
};

export type DeleteCareSpaceBody = MembershipChangeBody & {
  impactToken: string;
};

export type DeleteCareSpaceResult = {
  spaceId: string;
  deletedAt: string;
};
