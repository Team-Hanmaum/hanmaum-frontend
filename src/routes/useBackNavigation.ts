import { useNavigate } from "react-router";
import { hasPreviousAppEntry } from "./navigationHistory";

export function useBackNavigation(fallback: string) {
  const navigate = useNavigate();
  return () => {
    if (hasPreviousAppEntry()) void navigate(-1);
    else void navigate(fallback, { replace: true });
  };
}
