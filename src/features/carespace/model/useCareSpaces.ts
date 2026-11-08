import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { getCareSpaces } from "../api/careSpaceApi";
import type { CareSpaceSummary } from "../api/careSpaceTypes";
import { careSpaceKeys } from "./careSpaceKeys";

export function useCareSpaces({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<CareSpaceSummary[], ApiError>({
    queryKey: careSpaceKeys.list(),
    enabled: enabled && !isMockPreviewEnabled,
    queryFn: ({ signal }) => {
      // Manual refetch can bypass enabled, so preserve the Mock boundary here too.
      if (isMockPreviewEnabled) {
        throw new ApiError({
          kind: "configuration",
          message: "Mock 미리보기에서는 실제 참여 공간을 조회하지 않습니다.",
        });
      }
      return getCareSpaces(signal);
    },
  });
}
