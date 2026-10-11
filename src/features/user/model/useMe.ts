import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { getMe } from "../api/userApi";
import type { MyProfile } from "../api/userTypes";
import { userKeys } from "./userKeys";

export function useMe({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<MyProfile, ApiError>({
    queryKey: userKeys.me(),
    enabled: enabled && !isMockPreviewEnabled,
    queryFn: ({ signal }) => {
      // Manual refetch can bypass enabled, so preserve the Mock boundary here too.
      if (isMockPreviewEnabled) {
        throw new ApiError({
          kind: "configuration",
          message: "Mock 미리보기에서는 실제 내 정보를 조회하지 않습니다.",
        });
      }
      return getMe(signal);
    },
  });
}
