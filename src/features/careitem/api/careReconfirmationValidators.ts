import { isObject, isTimestamp } from "@/lib/api/responseValidators";
import { isVersion } from "./careReadValidators";
import type { ReconfirmedCareItem } from "./careReconfirmationTypes";
export const isReconfirmedCareItem = (
  value: unknown,
): value is ReconfirmedCareItem =>
  isObject(value) &&
  typeof value.itemId === "string" &&
  !!value.itemId.trim() &&
  isVersion(value.version) &&
  value.needsReconfirmation === false &&
  isTimestamp(value.updatedAt);
