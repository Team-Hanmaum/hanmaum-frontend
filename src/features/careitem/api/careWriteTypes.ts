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
export type ItemWriteIdentity = {
  clientRequestId: string;
  expectedItemVersion: string;
  leaseToken: string;
};
export type UpdateCareItemBody = ItemWriteIdentity & { values: CareValues };
export type ChangeItemStatusBody = ItemWriteIdentity & { status: string };
export type UpdatedCareItem = {
  itemId: string;
  version: string;
  updatedAt: string;
};
