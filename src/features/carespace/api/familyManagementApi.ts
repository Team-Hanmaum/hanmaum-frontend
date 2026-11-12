import { readApiData } from "@/lib/api/responseData";
import type {
  DeleteCareSpaceBody,
  DeleteCareSpaceResult,
  LeaveCareSpaceResult,
  MembershipChangeBody,
  RemoveSpaceMemberResult,
  SpaceDeletionImpact,
  TransferSpaceOwnershipBody,
  TransferSpaceOwnershipResult,
} from "./familyManagementTypes";
import {
  isDeleteCareSpaceResult,
  isLeaveCareSpaceResult,
  isRemoveSpaceMemberResult,
  isSpaceDeletionImpact,
  isTransferSpaceOwnershipResult,
} from "./familyManagementValidators";

const path = (spaceId: string) =>
  `/api/spaces/${encodeURIComponent(spaceId)}` as const;

export function removeSpaceMember(
  spaceId: string,
  membershipId: string,
  body: MembershipChangeBody,
): Promise<RemoveSpaceMemberResult> {
  return readApiData(
    `${path(spaceId)}/memberships/${encodeURIComponent(membershipId)}/removals`,
    (value): value is RemoveSpaceMemberResult =>
      isRemoveSpaceMemberResult(value) && value.membershipId === membershipId,
    { method: "POST", body },
  );
}

export function transferSpaceOwnership(
  spaceId: string,
  body: TransferSpaceOwnershipBody,
): Promise<TransferSpaceOwnershipResult> {
  return readApiData(
    `${path(spaceId)}/ownership-transfers`,
    (value): value is TransferSpaceOwnershipResult =>
      isTransferSpaceOwnershipResult(value) &&
      value.spaceId === spaceId &&
      value.ownerMembershipId === body.targetMembershipId,
    { method: "POST", body },
  );
}

export function leaveCareSpace(
  spaceId: string,
  body: MembershipChangeBody,
): Promise<LeaveCareSpaceResult> {
  return readApiData(`${path(spaceId)}/departures`, isLeaveCareSpaceResult, {
    method: "POST",
    body,
  });
}

export function getSpaceDeletionImpact(
  spaceId: string,
  signal?: AbortSignal,
): Promise<SpaceDeletionImpact> {
  return readApiData(
    `${path(spaceId)}/deletion-impact`,
    (value): value is SpaceDeletionImpact =>
      isSpaceDeletionImpact(value) && value.spaceId === spaceId,
    { signal },
  );
}

export function deleteCareSpace(
  spaceId: string,
  body: DeleteCareSpaceBody,
): Promise<DeleteCareSpaceResult> {
  return readApiData(
    `${path(spaceId)}/deletions`,
    (value): value is DeleteCareSpaceResult =>
      isDeleteCareSpaceResult(value) && value.spaceId === spaceId,
    { method: "POST", body },
  );
}
