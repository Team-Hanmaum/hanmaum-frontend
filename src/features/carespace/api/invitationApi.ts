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

function invalidResponse(status: number, message: string) {
  return new ApiError({ kind: "invalid-response", status, message });
}

// 발급은 201만 완료로 본다. 202 등 접수 응답을 발급 완료 링크로 노출하지 않는다.
export async function createInvitation(
  spaceId: string,
  request: InvitationRequest,
  signal?: AbortSignal,
): Promise<CreatedInvitation> {
  const result = await apiClient.request<unknown>(
    `/api/spaces/${encodeURIComponent(spaceId)}/invitations`,
    { method: "POST", expectedStatus: 201, body: request, signal },
  );
  const data = result.body.data;
  if (!isCreatedInvitation(data) || data.spaceId !== spaceId)
    throw invalidResponse(
      result.status,
      "초대 링크 발급 응답 형식을 확인할 수 없습니다.",
    );
  return data;
}

export function getInvitationPreview(
  token: string,
  signal?: AbortSignal,
): Promise<InvitationPreview> {
  return readApiData(invitationPath(token), isInvitationPreview, { signal });
}

// 신규 참여(201)와 이미 참여 중(200)을 구분하기 위해 HTTP 상태를 유지한다.
// 그 밖의 상태나 초대 확인 때와 다른 공간의 응답은 참여 완료로 처리하지 않는다.
export async function joinInvitation(
  token: string,
  expectedSpaceId: string,
  request: InvitationRequest,
  signal?: AbortSignal,
): Promise<JoinInvitationResult> {
  const result = await apiClient.request<unknown>(
    `${invitationPath(token)}/join`,
    { method: "POST", expectedStatus: [200, 201], body: request, signal },
  );
  const data = result.body.data;
  if (!isJoinedInvitation(data) || data.spaceId !== expectedSpaceId)
    throw invalidResponse(
      result.status,
      "초대 참여 응답 형식을 확인할 수 없습니다.",
    );
  return { joined: data, alreadyMember: result.status === 200 };
}
