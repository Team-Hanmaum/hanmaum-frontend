import type {
  CareDetail,
  ItemType,
} from "@/features/careitem/api/careReadTypes";

export type ShareLinkTarget = {
  itemId: string;
  expectedItemVersion: string;
  includesChange: boolean;
};
export type CreateShareLinkBody = {
  clientRequestId: string;
  targets: ShareLinkTarget[];
};
export type ShareCard = {
  itemType: ItemType;
  includesChange: boolean;
  url: string;
};
export type CreatedShareLink = {
  shareLinkId: string;
  shareUrl: string;
  cards: ShareCard[];
};
export type SharedItem =
  | { itemId: string; state: "AVAILABLE"; item: CareDetail }
  | {
      itemId: string;
      state: "DELETED" | "NEEDS_RECONFIRMATION";
      item: null;
    };
export type SharedItemsResponse = {
  spaceId: string;
  items: SharedItem[];
};
