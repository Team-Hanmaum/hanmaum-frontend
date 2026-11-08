import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { useSession } from "./useSession";

export function useLogout() {
  const session = useSession();

  return useMutation<void, ApiError, void>({
    mutationKey: ["auth", "logout"],
    mutationFn: () => {
      if (isMockPreviewEnabled) {
        throw new ApiError({
          kind: "configuration",
          message: "Mock 미리보기에서는 실제 로그아웃을 요청하지 않습니다.",
        });
      }
      return session.signOut();
    },
  });
}
