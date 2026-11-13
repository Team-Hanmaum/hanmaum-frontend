import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, normalizeApiError } from "@/lib/api";
import { useSession } from "@/features/auth/model/useSession";
import { getCareSpaces } from "@/features/carespace/api/careSpaceApi";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { careSpaceKeys } from "@/features/carespace/model/careSpaceKeys";

export function useWithdrawal() {
  const session = useSession();
  const client = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationKey: ["user", "withdrawal"],
    retry: false,
    onError: (error) => {
      if (error.code === "OWNED_SPACE_REMAINS")
        void client.invalidateQueries({ queryKey: careSpaceKeys.list() });
    },
    mutationFn: async () => {
      try {
        if (isMockPreviewEnabled)
          throw new ApiError({
            kind: "configuration",
            message: "예시 화면에서는 실제 계정을 삭제할 수 없어요.",
          });
        // Recheck ownership immediately before submission, rather than trusting
        // a space list cached before a transfer or another tab's action.
        const spaces = await getCareSpaces();
        if (spaces.some((space) => space.role === "OWNER"))
          throw new ApiError({
            kind: "http",
            status: 409,
            code: "OWNED_SPACE_REMAINS",
            message:
              "소유 중인 공간의 소유권 이전 또는 삭제를 먼저 완료해 주세요.",
          });
        await session.withdraw();
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
  });
}
