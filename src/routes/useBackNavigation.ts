import { useAppNavigate } from "@/routes/useAppNavigate";

import { previousAppEntryDelta } from "./navigationHistory";

export function useBackNavigation(
  fallback: string,
  { toFallback = false }: { toFallback?: boolean } = {},
) {
  const navigate = useAppNavigate();
  return () => {
    const delta = previousAppEntryDelta(toFallback ? fallback : undefined);
    if (delta !== undefined) void navigate(delta);
    else void navigate(fallback, { replace: true, motion: "back" });
  };
}
