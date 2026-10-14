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

export function newsCreatePath(careSpaceId: string) {
  return `${spacePath(careSpaceId, "news")}/new`;
}

export function newsDetailPath(careSpaceId: string, recordId: string) {
  return `${spacePath(careSpaceId, "news")}/${encodeURIComponent(recordId)}`;
}

export function invitationPath(token: string) {
  return `/invitations/${encodeURIComponent(token)}`;
}

export function proposalListPath(careSpaceId: string, status = "review") {
  return `${paths.spaces}/${encodeURIComponent(careSpaceId)}/proposals?status=${encodeURIComponent(status)}`;
}
export function proposalReviewPath(careSpaceId: string, recordId: string) {
  return `${newsDetailPath(careSpaceId, recordId)}/proposals`;
}
export function proposalConfirmPath(careSpaceId: string) {
  return `${paths.spaces}/${encodeURIComponent(careSpaceId)}/proposals/confirm`;
}
export function proposalRequestPath(careSpaceId: string, requestId: string) {
  return `${paths.spaces}/${encodeURIComponent(careSpaceId)}/proposal-requests/${encodeURIComponent(requestId)}`;
}
export function proposalResultPath(careSpaceId: string, resultId: string) {
  return `${paths.spaces}/${encodeURIComponent(careSpaceId)}/proposals/results/${encodeURIComponent(resultId)}`;
}
