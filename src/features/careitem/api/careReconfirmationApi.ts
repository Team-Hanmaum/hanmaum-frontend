import { readApiData } from "@/lib/api/responseData";
import type {
  ReconfirmCareItemBody,
  ReconfirmedCareItem,
} from "./careReconfirmationTypes";
import { isReconfirmedCareItem } from "./careReconfirmationValidators";
export function reconfirmCareItem(
  space: string,
  item: string,
  body: ReconfirmCareItemBody,
): Promise<ReconfirmedCareItem> {
  return readApiData(
    `/api/spaces/${encodeURIComponent(space)}/items/${encodeURIComponent(item)}/reconfirmations`,
    (value): value is ReconfirmedCareItem =>
      isReconfirmedCareItem(value) && value.itemId === item,
    { method: "POST", body },
  );
}
