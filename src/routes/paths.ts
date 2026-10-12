export const paths = {
  landing: "/",
  login: "/login",
  onboardingGuide: "/onboarding/guide",
  spaces: "/spaces",
  spaceCreate: "/spaces/new",
  invitationExample: "/invitations/mock-family",
  components: "/_dev/components",
} as const;

export const spaceTabs = ["home", "care", "news", "family", "all"] as const;
export type SpaceTab = (typeof spaceTabs)[number];

export function spacePath(careSpaceId: string, tab: SpaceTab = "home") {
  return `${paths.spaces}/${encodeURIComponent(careSpaceId)}/${tab}`;
}

export function spaceInvitePath(careSpaceId: string) {
  return `${paths.spaces}/${encodeURIComponent(careSpaceId)}/invite`;
}

export function invitationPath(token: string) {
  return `/invitations/${encodeURIComponent(token)}`;
}
