import { readApiData } from "@/lib/api/responseData";
import type { SpaceDetail, SpaceMember } from "./spaceDetailTypes";
import {
  isSpaceDetail,
  isSpaceMemberListResponse,
} from "./spaceDetailValidators";

export function getSpaceDetail(
  spaceId: string,
  signal?: AbortSignal,
): Promise<SpaceDetail> {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}`,
    (value): value is SpaceDetail =>
      isSpaceDetail(value) && value.spaceId === spaceId,
    { signal },
  );
}
export async function getSpaceMembers(
  spaceId: string,
  signal?: AbortSignal,
): Promise<SpaceMember[]> {
  return (
    await readApiData(
      `/api/spaces/${encodeURIComponent(spaceId)}/members`,
      isSpaceMemberListResponse,
      { signal },
    )
  ).items;
}
