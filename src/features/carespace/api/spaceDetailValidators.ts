import {
  isObject,
  isNullableString,
  isTimestamp,
} from "@/lib/api/responseValidators";
import { isCareSpaceSummary } from "./careSpaceValidators";
import type { SpaceDetail, SpaceMemberListResponse } from "./spaceDetailTypes";

export function isSpaceDetail(value: unknown): value is SpaceDetail {
  return (
    isObject(value) &&
    isCareSpaceSummary(value) &&
    typeof value.version === "string" &&
    /^[1-9]\d*$/.test(value.version) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  );
}

export function isSpaceMemberListResponse(
  value: unknown,
): value is SpaceMemberListResponse {
  return (
    isObject(value) &&
    Array.isArray(value.items) &&
    value.items.every(
      (item: unknown) =>
        isObject(item) &&
        typeof item.membershipId === "string" &&
        isNullableString(item.displayName) &&
        (item.role === "OWNER" || item.role === "MEMBER") &&
        typeof item.isMe === "boolean",
    )
  );
}
