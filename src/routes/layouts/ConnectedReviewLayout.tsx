import { Outlet } from "react-router";
import { useConnectedSpace } from "../useConnectedSpace";
// 같은 공간 안에서 검토 화면을 이동할 때 초안과 편집 상태를 유지한다.
export function ConnectedReviewLayout() {
  const context = useConnectedSpace();
  return (
    <Outlet
      context={context}
      key={context.space.spaceId}
    />
  );
}
