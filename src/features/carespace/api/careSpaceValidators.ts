import type {
  CareSpaceListResponse,
  CareSpaceSummary,
  CreatedCareSpace,
} from "./careSpaceTypes";

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
