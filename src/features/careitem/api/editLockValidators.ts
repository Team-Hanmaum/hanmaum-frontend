import {
  isObject,
  isCount,
  isTimestamp,
  isNullableString,
} from "@/lib/api/responseValidators";
import type { EditLease } from "./editLockTypes";
export const isEditLease = (v: unknown): v is EditLease =>
  isObject(v) &&
  typeof v.itemId === "string" &&
  isNullableString(v.leaseToken) &&
  typeof v.holderMembershipId === "string" &&
  isTimestamp(v.expiresAt) &&
  isCount(v.renewAfterSeconds) &&
  v.renewAfterSeconds > 0;
