import { useCallback } from "react";
import {
  useNavigate,
  type NavigateFunction,
  type NavigateOptions,
  type To,
} from "react-router";
import { canAnimateNavigation } from "./routeMotion";

// 기존 navigate 계약을 유지하고 명시적인 화면 이동에만 전환을 요청한다.
export function useAppNavigate(): NavigateFunction {
  const navigate = useNavigate();
  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      // React Router가 전환했던 경로 쌍의 POP(뒤로/앞으로)을 복원한다.
      if (typeof to === "number") return navigate(to);
      return navigate(to, {
        viewTransition: canAnimateNavigation(),
        ...options,
      });
    },
    [navigate],
  );
}
