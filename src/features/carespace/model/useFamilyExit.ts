import { useState } from "react";
import { useMockAction } from "@/lib/useMockAction";
import { mockCareSpaces } from "./mockCareSpaces";
import { mockFamilyActions } from "./mockFamilyActions";

export const familyExitStates = [
  { value: "default", label: "정상 흐름" },
  { value: "error", label: "확정 실패 예시" },
  { value: "forbidden", label: "접근·권한 없음" },
] as const;

// 공간 종료 후의 목적지 선택은 호출 페이지에서 결정한다.
export function useFamilyExit(
  spaceId: string,
  operation: "leave" | "deleteSpace",
  onComplete: (noticeId: string) => void,
) {
  const { pending, run } = useMockAction();
  const [error, setError] = useState("");
  function submit(simulateFailure: boolean, onFailureShown: () => void) {
    setError("");
    run(() => {
      if (simulateFailure) {
        setError(
          "아직 처리되지 않았어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
        );
        onFailureShown();
        return;
      }
      const result = mockFamilyActions[operation](spaceId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const notice = mockCareSpaces.getSnapshot().lastExit;
      if (notice?.spaceId === spaceId) onComplete(notice.id);
    });
  }
  return { pending, error, submit, clearError: () => setError("") };
}
