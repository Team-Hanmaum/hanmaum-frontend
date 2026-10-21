import { useCallback } from "react";
import {
  useNavigate,
  useLocation,
  type NavigateOptions,
  type To,
} from "react-router";
import { canAnimateNavigation } from "./routeMotion";

type AppNavigateOptions = NavigateOptions & { motion?: "back" };
type AppNavigate = {
  (to: To, options?: AppNavigateOptions): void | Promise<void>;
  (delta: number): void | Promise<void>;
};

// 기존 navigate 계약을 유지하고 명시적인 화면 이동에만 전환을 요청한다.
export function useAppNavigate(): AppNavigate {
  const navigate = useNavigate();
  const { key } = useLocation();
  return useCallback(
    (to: To | number, options?: AppNavigateOptions) => {
      // React Router가 전환했던 경로 쌍의 POP(뒤로/앞으로)을 복원한다.
      if (typeof to === "number") return navigate(to);
      const { motion, ...navigationOptions } = options ?? {};
      return navigate(to, {
        viewTransition: canAnimateNavigation(),
        ...navigationOptions,
        // 이동이 폼 이탈 확인에 막혀도 재개할 때 방향을 유지한다.
        // 출발 key로 묶어 이후 이력 복원이나 state 재사용에 전파하지 않는다.
        ...(motion === "back" && {
          state: { ...navigationOptions.state, __hmBackFrom: key },
        }),
      });
    },
    [navigate, key],
  );
}
