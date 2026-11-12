import { readApiData } from "@/lib/api/responseData";
import type { CreateCareItemBody, CreatedCareItem } from "./careWriteTypes";
import { isCreatedCareItem } from "./careWriteValidators";
import type {
  UpdateCareItemBody,
  ChangeItemStatusBody,
  UpdatedCareItem,
} from "./careWriteTypes";
import { isUpdatedCareItem } from "./careWriteValidators";

const itemPath = (space: string, item: string) =>
  `/api/spaces/${encodeURIComponent(space)}/items/${encodeURIComponent(item)}` as const;

export function createCareItem(spaceId: string, body: CreateCareItemBody) {
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
) {
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
) {
  return readApiData(
    `${itemPath(space, item)}/status`,
    (v): v is UpdatedCareItem => isUpdatedCareItem(v) && v.itemId === item,
    { method: "PATCH", body },
  );
}
