import type { CareSpaceRole } from "./careSpaceTypes";

// 초대 발급·참여 요청. 같은 발급·참여 시도의 재전송에는 같은 clientRequestId를 사용한다.
export interface InvitationRequest {
  clientRequestId: string;
}
// POST /api/spaces/{spaceId}/invitations (201)
export interface CreatedInvitation {
  invitationId: string;
  spaceId: string;
  invitationUrl: string;
  issuedAt: string;
  expiresAt: string;
}
// GET /api/invitations/{invitationToken}: 가입 전 공간 이름·내용은 노출하지 않는다.
export interface InvitationPreview {
  invitationId: string;
  spaceId: string;
  expiresAt: string;
  isMember: boolean;
}
// POST /api/invitations/{invitationToken}/join: 신규 201, 기존 참여 200
export interface JoinedInvitation {
  spaceId: string;
  membershipId: string;
  role: CareSpaceRole;
  joinedAt: string;
}
export interface JoinInvitationResult {
  joined: JoinedInvitation;
  alreadyMember: boolean;
}
