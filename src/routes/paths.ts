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
export function newsDeletePath(careSpaceId: string, recordId: string) {
  return `${newsDetailPath(careSpaceId, recordId)}/delete`;
}
export function newsDeletionPath(careSpaceId: string, deletionId: string) {
  return `${spacePath(careSpaceId, "news")}/deletions/${encodeURIComponent(deletionId)}`;
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
export function proposalEditPath(careSpaceId: string, proposalId: string) {
  return `${paths.spaces}/${encodeURIComponent(careSpaceId)}/proposals/${encodeURIComponent(proposalId)}/edit`;
}
export function proposalTargetPath(careSpaceId: string, proposalId: string) {
  return `${paths.spaces}/${encodeURIComponent(careSpaceId)}/proposals/${encodeURIComponent(proposalId)}/target`;
}
export function proposalEvidencePath(careSpaceId: string, proposalId: string) {
  return `${paths.spaces}/${encodeURIComponent(careSpaceId)}/proposals/${encodeURIComponent(proposalId)}/evidence`;
}
export function careItemPath(careSpaceId: string, itemId: string) {
  return `${spacePath(careSpaceId, "care")}/items/${encodeURIComponent(itemId)}`;
}
export function careSourcesPath(careSpaceId: string, itemId: string) {
  return `${careItemPath(careSpaceId, itemId)}/sources`;
}
export function careReconfirmPath(careSpaceId: string, itemId: string) {
  return `${careItemPath(careSpaceId, itemId)}/reconfirm`;
}
export function careHistoryPath(
  careSpaceId: string,
  itemId: string,
  historyId?: string,
) {
  return `${careItemPath(careSpaceId, itemId)}/history${historyId ? `/${encodeURIComponent(historyId)}` : ""}`;
}
