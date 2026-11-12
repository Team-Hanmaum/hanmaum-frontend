import { readApiData } from "@/lib/api/responseData";
import { isObject } from "@/lib/api/responseValidators";
import type {
  CareDetail,
  CareEvidence,
  CareHistoryDetail,
  CareHistoryEntry,
  ItemType,
} from "./careReadTypes";
import {
  isCareList,
  isCareDetail,
  isCareEvidence,
  isCareHistoryEntry,
  isCareHistoryDetail,
} from "./careReadValidators";
const base = (spaceId: string) =>
  `/api/spaces/${encodeURIComponent(spaceId)}/items` as const;
const item = (spaceId: string, itemId: string) =>
  `${base(spaceId)}/${encodeURIComponent(itemId)}` as const;
export function getCareItems(
  spaceId: string,
  itemType: ItemType,
  view?: string,
  signal?: AbortSignal,
) {
  return readApiData(base(spaceId), isCareList, {
    params: { itemType, ...(view && { view }) },
    signal,
  });
}
export function getCareItem(
  spaceId: string,
  itemId: string,
  signal?: AbortSignal,
) {
  return readApiData(
    item(spaceId, itemId),
    (v): v is CareDetail =>
      isCareDetail(v) && v.spaceId === spaceId && v.itemId === itemId,
    { signal },
  );
}
export function getCareEvidence(
  spaceId: string,
  itemId: string,
  signal?: AbortSignal,
) {
  return readApiData(
    `${item(spaceId, itemId)}/evidence`,
    (v): v is { items: CareEvidence[] } =>
      isObject(v) && Array.isArray(v.items) && v.items.every(isCareEvidence),
    { signal },
  );
}
export function getCareHistory(
  spaceId: string,
  itemId: string,
  signal?: AbortSignal,
) {
  return readApiData(
    `${item(spaceId, itemId)}/history`,
    (v): v is { items: CareHistoryEntry[] } =>
      isObject(v) &&
      Array.isArray(v.items) &&
      v.items.every(isCareHistoryEntry),
    { signal },
  );
}
export function getCareHistoryDetail(
  spaceId: string,
  itemId: string,
  version: string,
  signal?: AbortSignal,
) {
  return readApiData(
    `${item(spaceId, itemId)}/history/${encodeURIComponent(version)}`,
    (v): v is CareHistoryDetail =>
      isCareHistoryDetail(v) && v.itemId === itemId && v.version === version,
    { signal },
  );
}
