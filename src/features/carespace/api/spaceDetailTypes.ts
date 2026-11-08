import type { CareSpaceSummary, CareSpaceRole } from "./careSpaceTypes";

export interface SpaceDetail extends CareSpaceSummary {
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceMember {
  membershipId: string;
  displayName: string | null;
  role: CareSpaceRole;
  isMe: boolean;
}

export interface SpaceMemberListResponse {
  items: SpaceMember[];
}
