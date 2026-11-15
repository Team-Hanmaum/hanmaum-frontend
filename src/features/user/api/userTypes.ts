export type SocialProvider = "GOOGLE" | "KAKAO";

export interface MyProfile {
  userId: string;
  displayName: string | null;
  profileImageUrl?: string | null;
  providers: SocialProvider[];
}
