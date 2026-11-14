import { Outlet } from "react-router";
import { useSpaceContext } from "../useSpaceContext";
// 같은 공간 안에서 검토 화면을 이동할 때 초안과 편집 상태를 유지한다.
export function ReviewLayout() {
  const context = useSpaceContext();
  return (
    <Outlet
      context={context}
      key={context.space.spaceId}
    />
  );
}
