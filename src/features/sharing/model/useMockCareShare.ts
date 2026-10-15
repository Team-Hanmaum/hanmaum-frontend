import { useMockScreenState } from "@/routes/useMockScreenState";
import { useMockAction } from "@/lib/useMockAction";

export const careShareStates = [
  { value: "preview", label: "미리보기" },
  { value: "external", label: "외부 앱 단계" },
  { value: "returned", label: "공유 화면에서 복귀" },
  { value: "cancelled", label: "공유 취소" },
  { value: "error", label: "공유 실행 실패" },
  { value: "unavailable", label: "공유 불가" },
] as const;
export const sharedCareStates = [
  { value: "login", label: "로그인 필요" },
  { value: "member", label: "참여자 확인" },
  { value: "forbidden", label: "참여 권한 없음" },
  { value: "unavailable", label: "항목 접근 불가" },
] as const;

// SDK 실행·외부 전송 없이 복귀/취소/실패를 확인하는 화면 전용 상태.
export function useMockCareShare() {
  const [state, setState] = useMockScreenState(careShareStates, "preview");
  const { pending, run } = useMockAction();
  return {
    state,
    setState,
    pending,
    open: () => run(() => setState("external")),
  };
}
