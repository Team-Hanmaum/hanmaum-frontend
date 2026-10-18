import { useLocation, useSearchParams } from "react-router";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { useQaMode } from "@/lib/useQaMode";

export function useMockScreenState<T extends string>(
  options: readonly { value: T; label: string }[],
  fallback: T,
) {
  const [params, setParams] = useSearchParams();
  const { state: navigationState } = useLocation();
  const { enabled: qaEnabled } = useQaMode();
  // QA에서 고른 상태만 종료 시 무시한다. 생성·참여·공유 등 Mock 흐름은 유지한다.
  const requested =
    (qaEnabled ? params.get("qaState") : null) ?? params.get("mockState");
  const state = isMockPreviewEnabled
    ? (options.find((option) => option.value === requested)?.value ?? fallback)
    : fallback;
  function setState(value: string) {
    if (
      !isMockPreviewEnabled ||
      !options.some((option) => option.value === value)
    )
      return;
    void setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set(qaEnabled ? "qaState" : "mockState", value);
        return next;
      },
      { replace: true, preventScrollReset: true, state: navigationState },
    );
  }
  return [state, setState] as const;
}
