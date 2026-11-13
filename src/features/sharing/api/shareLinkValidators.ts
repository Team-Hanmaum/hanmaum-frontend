import { isObject } from "@/lib/api/responseValidators";
import {
  isCareDetail,
  isItemType,
} from "@/features/careitem/api/careReadValidators";
import type {
  CreatedShareLink,
  SharedItem,
  SharedItemsResponse,
} from "./shareLinkTypes";

export function isShareUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      /^\/share\/[A-Za-z0-9_-]{43}$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function isCreatedShareLink(value: unknown): value is CreatedShareLink {
  return (
    isObject(value) &&
    typeof value.shareLinkId === "string" &&
    !!value.shareLinkId &&
    isShareUrl(value.shareUrl) &&
    Array.isArray(value.cards) &&
    value.cards.length > 0 &&
    value.cards.every(
      (card) =>
        isObject(card) &&
        isItemType(card.itemType) &&
        typeof card.includesChange === "boolean" &&
        card.url === value.shareUrl,
    )
  );
}

function isSharedItem(value: unknown): value is SharedItem {
  if (!isObject(value) || typeof value.itemId !== "string" || !value.itemId)
    return false;
  if (value.state === "AVAILABLE") {
    return (
      isCareDetail(value.item) &&
      value.item.itemId === value.itemId &&
      !value.item.needsReconfirmation &&
      value.item.visibility !== "DELETED"
    );
  }
  return (
    (value.state === "DELETED" || value.state === "NEEDS_RECONFIRMATION") &&
    value.item === null
  );
}

export function isSharedItems(value: unknown): value is SharedItemsResponse {
  return (
    isObject(value) &&
    typeof value.spaceId === "string" &&
    !!value.spaceId &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.every(isSharedItem) &&
    new Set(value.items.map((entry) => entry.itemId)).size ===
      value.items.length &&
    value.items.every(
      (entry) => entry.item === null || entry.item.spaceId === value.spaceId,
    )
  );
}
