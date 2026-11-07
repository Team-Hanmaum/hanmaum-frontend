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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isCareSpaceSummary(value: unknown): value is CareSpaceSummary {
  return (
    isRecord(value) &&
    typeof value.spaceId === "string" &&
    typeof value.subjectLabel === "string" &&
    typeof value.membershipId === "string" &&
    (value.role === "OWNER" || value.role === "MEMBER") &&
    // 인원수는 소유자·본인을 포함한 현재 참여자 수라 1 이상의 정수다.
    Number.isInteger(value.memberCount) &&
    (value.memberCount as number) >= 1
  );
}

export function isCareSpaceListResponse(
  value: unknown,
): value is CareSpaceListResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isCareSpaceSummary)
  );
}

export function isCreatedCareSpace(value: unknown): value is CreatedCareSpace {
  return (
    isRecord(value) &&
    typeof value.spaceId === "string" &&
    typeof value.membershipId === "string"
  );
}
