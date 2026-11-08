import {
  isObject,
  isNullableString,
  isTimestamp,
  readApiData,
} from "@/lib/api/responseData";
import {
  isCareSpaceSummary,
  type CareSpaceSummary,
  type CareSpaceRole,
} from "./careSpaceTypes";

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
function isMembers(value: unknown): value is { items: SpaceMember[] } {
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
export function getSpaceDetail(spaceId: string, signal?: AbortSignal) {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}`,
    (value): value is SpaceDetail =>
      isSpaceDetail(value) && value.spaceId === spaceId,
    { signal },
  );
}
export async function getSpaceMembers(spaceId: string, signal?: AbortSignal) {
  return (
    await readApiData(
      `/api/spaces/${encodeURIComponent(spaceId)}/members`,
      isMembers,
      { signal },
    )
  ).items;
}
