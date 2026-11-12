import { Outlet, useParams } from "react-router";
import { useConnectedSpace } from "../useConnectedSpace";
import { ProposalRouteLayout } from "./ProposalRouteLayout";
// 미연동 직접 입력 흐름에서 만든 mock 항목은 계속 명시적인 예시 화면에서만 읽는다.
export function ConnectedReviewLayout() {
  const context = useConnectedSpace();
  const params = useParams();
  if (params.itemId?.startsWith("mock-")) return <ProposalRouteLayout />;
  return (
    <Outlet
      context={context}
      key={context.space.spaceId}
    />
  );
}
