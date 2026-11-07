import { apiClient, ApiError } from "@/lib/api";
import {
  isCareSpaceListResponse,
  isCreatedCareSpace,
  type CareSpaceSummary,
  type CreateCareSpaceRequest,
  type CreatedCareSpace,
} from "./careSpaceTypes";

export async function getCareSpaces(
  signal?: AbortSignal,
): Promise<CareSpaceSummary[]> {
  const result = await apiClient.request<unknown>("/api/spaces", { signal });
  if (!isCareSpaceListResponse(result.body.data)) {
    throw new ApiError({
      kind: "invalid-response",
      status: result.status,
      message: "참여 공간 목록 응답 형식을 확인할 수 없습니다.",
    });
  }
  return result.body.data.items;
}

export async function createCareSpace(
  request: CreateCareSpaceRequest,
  signal?: AbortSignal,
): Promise<CreatedCareSpace> {
  const result = await apiClient.request<unknown>("/api/spaces", {
    method: "POST",
    body: request,
    signal,
  });
  if (!isCreatedCareSpace(result.body.data)) {
    throw new ApiError({
      kind: "invalid-response",
      status: result.status,
      message: "공간 생성 응답 형식을 확인할 수 없습니다.",
    });
  }
  return result.body.data;
}
