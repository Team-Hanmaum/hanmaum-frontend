import { apiClient, ApiError } from "@/lib/api";
import type { MyProfile } from "./userTypes";
import { isMyProfile } from "./userValidators";

export async function getMe(signal?: AbortSignal): Promise<MyProfile> {
  const result = await apiClient.request<unknown>("/api/users/me", {
    signal,
    session: "independent",
  });
  if (!isMyProfile(result.body.data)) {
    throw new ApiError({
      kind: "invalid-response",
      status: result.status,
      message: "내 정보 응답 형식을 확인할 수 없습니다.",
    });
  }
  return result.body.data;
}
