import { apiClient, ApiError } from "@/lib/api";
import { readApiData } from "@/lib/api/responseData";
import type {
  CreatedInvitation,
  InvitationPreview,
  InvitationRequest,
  JoinInvitationResult,
} from "./invitationTypes";
import {
  isCreatedInvitation,
  isInvitationPreview,
  isJoinedInvitation,
} from "./invitationValidators";

const invitationPath = (token: string) =>
  `/api/invitations/${encodeURIComponent(token)}` as const;

export function createInvitation(
  spaceId: string,
  request: InvitationRequest,
  signal?: AbortSignal,
): Promise<CreatedInvitation> {
  return readApiData(
    `/api/spaces/${encodeURIComponent(spaceId)}/invitations`,
    (value): value is CreatedInvitation =>
      isCreatedInvitation(value) && value.spaceId === spaceId,
    { method: "POST", body: request, signal },
  );
}

export function getInvitationPreview(
  token: string,
  signal?: AbortSignal,
): Promise<InvitationPreview> {
  return readApiData(invitationPath(token), isInvitationPreview, { signal });
}

// 신규 참여(201)와 이미 참여 중(200)을 구분하기 위해 HTTP 상태를 유지한다.
export async function joinInvitation(
  token: string,
  request: InvitationRequest,
  signal?: AbortSignal,
): Promise<JoinInvitationResult> {
  const result = await apiClient.request<unknown>(
    `${invitationPath(token)}/join`,
    { method: "POST", body: request, signal },
  );
  if (!isJoinedInvitation(result.body.data))
    throw new ApiError({
      kind: "invalid-response",
      status: result.status,
      message: "초대 참여 응답 형식을 확인할 수 없습니다.",
    });
  return { joined: result.body.data, alreadyMember: result.status === 200 };
}
