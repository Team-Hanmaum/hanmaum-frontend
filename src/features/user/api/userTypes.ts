export type SocialProvider = "GOOGLE" | "KAKAO";

export interface MyProfile {
  userId: string;
  displayName: string | null;
  providers: SocialProvider[];
}

export function isMyProfile(value: unknown): value is MyProfile {
  return (
    typeof value === "object" &&
    value !== null &&
    "userId" in value &&
    typeof value.userId === "string" &&
    "displayName" in value &&
    (value.displayName === null || typeof value.displayName === "string") &&
    "providers" in value &&
    Array.isArray(value.providers) &&
    value.providers.every(
      (provider) => provider === "GOOGLE" || provider === "KAKAO",
    )
  );
}
