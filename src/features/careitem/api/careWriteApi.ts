import { readApiData } from "@/lib/api/responseData";
import type {
  CreateCareItemBody,
  CreatedCareItem,
  UpdateCareItemBody,
  ChangeItemStatusBody,
  UpdatedCareItem,
  AnswerCareItemBody,
  SubmittedCareAnswer,
  ItemWriteIdentity,
  DeletedCareItem,
} from "./careWriteTypes";
import {
  isCreatedCareItem,
  isUpdatedCareItem,
  isSubmittedCareAnswer,
  isDeletedCareItem,
} from "./careWriteValidators";

const itemPath = (space: string, item: string) =>
  `/api/spaces/${encodeURIComponent(space)}/items/${encodeURIComponent(item)}` as const;

export function createCareItem(
  spaceId: string,
  body: CreateCareItemBody,
): Promise<CreatedCareItem> {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}/items`,
    (value): value is CreatedCareItem =>
      isCreatedCareItem(value) && value.itemType === body.itemType,
    { method: "POST", expectedStatus: 201, body },
  );
}
export function updateCareItem(
  space: string,
  item: string,
  body: UpdateCareItemBody,
): Promise<UpdatedCareItem> {
  return readApiData(
    itemPath(space, item),
    (v): v is UpdatedCareItem => isUpdatedCareItem(v) && v.itemId === item,
    { method: "PATCH", body },
  );
}
export function changeCareItemStatus(
  space: string,
  item: string,
  body: ChangeItemStatusBody,
): Promise<UpdatedCareItem> {
  return readApiData(
    `${itemPath(space, item)}/status`,
    (v): v is UpdatedCareItem => isUpdatedCareItem(v) && v.itemId === item,
    { method: "PATCH", body },
  );
}
export function answerCareItem(
  space: string,
  item: string,
  body: AnswerCareItemBody,
): Promise<SubmittedCareAnswer> {
  return readApiData(
    `${itemPath(space, item)}/answers`,
    isSubmittedCareAnswer,
    { method: "POST", expectedStatus: 201, body },
  );
}
export function deleteCareItem(
  space: string,
  item: string,
  body: ItemWriteIdentity,
): Promise<DeletedCareItem> {
  return readApiData(
    `${itemPath(space, item)}/deletions`,
    (v): v is DeletedCareItem => isDeletedCareItem(v) && v.itemId === item,
    { method: "POST", body },
  );
}
