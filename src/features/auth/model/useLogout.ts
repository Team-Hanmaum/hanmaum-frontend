import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { logout } from "../api/authApi";
import { resetSessionState } from "./resetSessionState";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationKey: ["auth", "logout"],
    mutationFn: () => {
      if (isMockPreviewEnabled) {
        throw new ApiError({
          kind: "configuration",
          message: "Mock 미리보기에서는 실제 로그아웃을 요청하지 않습니다.",
        });
      }
      return logout();
    },
    onSuccess: () => resetSessionState(queryClient),
    onError: (error) => {
      if (error.status === 401 && error.code === "UNAUTHENTICATED") {
        return resetSessionState(queryClient);
      }
      // FORBIDDEN or a lost response must not be presented as successful logout.
    },
  });
}
