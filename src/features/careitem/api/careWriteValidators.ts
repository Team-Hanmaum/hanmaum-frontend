import { isObject, isTimestamp } from "@/lib/api/responseValidators";
import { isVersion } from "./careReadValidators";
import type {
  CreatedCareItem,
  UpdatedCareItem,
  SubmittedCareAnswer,
  DeletedCareItem,
} from "./careWriteTypes";

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
export const isSubmittedCareAnswer = (
  value: unknown,
): value is SubmittedCareAnswer =>
  isObject(value) &&
  [value.answerId, value.requestId, value.requestEntryId].every(
    (id) => typeof id === "string" && !!id,
  ) &&
  value.status === "PENDING" &&
  value.questionStatus === "UNCONFIRMED" &&
  isTimestamp(value.submittedAt);
export const isDeletedCareItem = (value: unknown): value is DeletedCareItem =>
  isObject(value) &&
  typeof value.itemId === "string" &&
  !!value.itemId &&
  isVersion(value.version) &&
  value.visibility === "DELETED" &&
  isTimestamp(value.deletedAt);
