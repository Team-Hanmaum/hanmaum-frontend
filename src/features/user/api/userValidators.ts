import { isNullableString, isObject } from "@/lib/api/responseValidators";
import type { MyProfile } from "./userTypes";

export function isMyProfile(value: unknown): value is MyProfile {
  return (
    isObject(value) &&
    typeof value.userId === "string" &&
    isNullableString(value.displayName) &&
    isNullableString(value.profileImageUrl ?? null) &&
    Array.isArray(value.providers) &&
    value.providers.every(
      (provider) => provider === "GOOGLE" || provider === "KAKAO",
    )
  );
}
