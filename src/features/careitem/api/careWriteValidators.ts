import { isObject, isTimestamp } from "@/lib/api/responseValidators";
import { isVersion } from "./careReadValidators";
import type { CreatedCareItem } from "./careWriteTypes";

export const isCreatedCareItem = (value: unknown): value is CreatedCareItem =>
  isObject(value) &&
  typeof value.itemId === "string" &&
  !!value.itemId &&
  typeof value.itemType === "string" &&
  ["SCHEDULE", "TASK", "QUESTION"].includes(value.itemType) &&
  isVersion(value.version) &&
  isTimestamp(value.createdAt);
