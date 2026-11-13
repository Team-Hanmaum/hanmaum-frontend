import { readApiData } from "@/lib/api/responseData";
import type { CreateShareLinkBody, CreatedShareLink } from "./shareLinkTypes";
import { isCreatedShareLink, isSharedItems } from "./shareLinkValidators";

export function createShareLink(spaceId: string, body: CreateShareLinkBody) {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}/share-links`,
    (value): value is CreatedShareLink =>
      isCreatedShareLink(value) && value.cards.length === body.targets.length,
    { method: "POST", expectedStatus: 201, body },
  );
}

export function getSharedItems(token: string, signal?: AbortSignal) {
  return readApiData(
    `/api/share-links/${encodeURIComponent(token)}`,
    isSharedItems,
    { signal },
  );
}
