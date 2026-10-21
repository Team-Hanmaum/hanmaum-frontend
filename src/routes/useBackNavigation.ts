import { useAppNavigate } from "@/routes/useAppNavigate";

import { hasPreviousAppEntry } from "./navigationHistory";

export function useBackNavigation(fallback: string) {
  const navigate = useAppNavigate();
  return () => {
    if (hasPreviousAppEntry()) void navigate(-1);
    else void navigate(fallback, { replace: true });
  };
}
