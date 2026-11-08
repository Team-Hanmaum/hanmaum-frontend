export type CareSpaceRole = "OWNER" | "MEMBER";

// GET /api/spaces 목록 항목. 참여 ID와 역할은 요청자 기준이다.
export interface CareSpaceSummary {
  spaceId: string;
  subjectLabel: string;
  membershipId: string;
  role: CareSpaceRole;
  memberCount: number;
}

export interface CareSpaceListResponse {
  items: CareSpaceSummary[];
}

// POST /api/spaces 요청. 한 생성 시도의 재전송에는 같은 clientRequestId를 유지한다.
export interface CreateCareSpaceRequest {
  subjectLabel: string;
  clientRequestId: string;
}

export interface CreatedCareSpace {
  spaceId: string;
  membershipId: string;
}
