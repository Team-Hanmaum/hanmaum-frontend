import type { CareValues } from "./careReadTypes";

export type CreatableItemType = "SCHEDULE" | "TASK" | "QUESTION";
export type CreateCareItemBody = {
  clientRequestId: string;
  itemType: CreatableItemType;
  title: string;
  description: string | null;
  fields: CareValues;
};
export type CreatedCareItem = {
  itemId: string;
  itemType: CreatableItemType;
  version: string;
  createdAt: string;
};
