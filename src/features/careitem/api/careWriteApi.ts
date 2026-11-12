import { readApiData } from "@/lib/api/responseData";
import type { CreateCareItemBody, CreatedCareItem } from "./careWriteTypes";
import { isCreatedCareItem } from "./careWriteValidators";

export function createCareItem(spaceId: string, body: CreateCareItemBody) {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}/items`,
    (value): value is CreatedCareItem =>
      isCreatedCareItem(value) && value.itemType === body.itemType,
    { method: "POST", expectedStatus: 201, body },
  );
}
