import { isCount, isObject, isTimestamp } from "@/lib/api/responseValidators";
import type {
  DeleteCareSpaceResult,
  LeaveCareSpaceResult,
  RemoveSpaceMemberResult,
  SpaceDeletionImpact,
  TransferSpaceOwnershipResult,
} from "./familyManagementTypes";

const nonempty = (value: unknown): value is string =>
  typeof value === "string" && !!value.trim();
const version = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[1-9]\d{0,18}$/.test(value) &&
  BigInt(value) <= 9223372036854775807n;

export function isLeaveCareSpaceResult(
  value: unknown,
): value is LeaveCareSpaceResult {
  return (
    isObject(value) &&
    nonempty(value.membershipId) &&
    isTimestamp(value.endedAt)
  );
}

export function isRemoveSpaceMemberResult(
  value: unknown,
): value is RemoveSpaceMemberResult {
  return (
    isObject(value) &&
    version(value.spaceVersion) &&
    isLeaveCareSpaceResult(value)
  );
}

export function isTransferSpaceOwnershipResult(
  value: unknown,
): value is TransferSpaceOwnershipResult {
  return (
    isObject(value) &&
    nonempty(value.spaceId) &&
    nonempty(value.ownerMembershipId) &&
    value.myRole === "MEMBER" &&
    version(value.spaceVersion)
  );
}

export function isSpaceDeletionImpact(
  value: unknown,
): value is SpaceDeletionImpact {
  if (
    !isObject(value) ||
    !nonempty(value.spaceId) ||
    !version(value.spaceVersion) ||
    typeof value.impactToken !== "string" ||
    !/^[0-9a-f]{64}$/.test(value.impactToken) ||
    !isObject(value.counts)
  )
    return false;
  const counts = value.counts;
  return [
    "members",
    "records",
    "items",
    "proposals",
    "requests",
    "historyEntries",
  ].every((key) => isCount(counts[key]));
}

export function isDeleteCareSpaceResult(
  value: unknown,
): value is DeleteCareSpaceResult {
  return (
    isObject(value) && nonempty(value.spaceId) && isTimestamp(value.deletedAt)
  );
}
