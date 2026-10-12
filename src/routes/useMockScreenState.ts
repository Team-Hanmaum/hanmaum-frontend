import { useSearchParams } from "react-router";
import { isMockPreviewEnabled } from "@/lib/mockPreview";

export function useMockScreenState<T extends string>(
  options: readonly { value: T; label: string }[],
  fallback: T,
) {
  const [params, setParams] = useSearchParams();
  const requested = params.get("mockState");
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
        next.set("mockState", value);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }
  return [state, setState] as const;
}
