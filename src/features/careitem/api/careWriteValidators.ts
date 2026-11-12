import { isObject, isTimestamp } from "@/lib/api/responseValidators";
import { isVersion } from "./careReadValidators";
import type { CreatedCareItem, UpdatedCareItem } from "./careWriteTypes";

export const isCreatedCareItem = (value: unknown): value is CreatedCareItem =>
  isObject(value) &&
  typeof value.itemId === "string" &&
  !!value.itemId &&
  typeof value.itemType === "string" &&
  ["SCHEDULE", "TASK", "QUESTION"].includes(value.itemType) &&
  isVersion(value.version) &&
  isTimestamp(value.createdAt);
export const isUpdatedCareItem = (value: unknown): value is UpdatedCareItem =>
  isObject(value) &&
  typeof value.itemId === "string" &&
  !!value.itemId &&
  isVersion(value.version) &&
  isTimestamp(value.updatedAt);
