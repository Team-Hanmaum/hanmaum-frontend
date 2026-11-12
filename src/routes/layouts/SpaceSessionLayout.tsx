import { Outlet, useMatches, useParams } from "react-router";
import { ConnectedSpaceLayout } from "./ConnectedSpaceLayout";

export function SpaceSessionLayout() {
  const { careSpaceId } = useParams();
  const matches = useMatches();
  const familyManagement = matches.some(
    ({ handle }) =>
      typeof handle === "object" &&
      handle !== null &&
      "familyManagement" in handle &&
      handle.familyManagement === true,
  );
  // 종료 작업 뒤 접근 권한이 사라져도 처리 결과와 같은 요청 재확인을 유지한다.
  // 실제 접근 권한은 각 가족 관리 화면과 API에서 확인한다.
  if (familyManagement) return <Outlet key={careSpaceId} />;
  return <ConnectedSpaceLayout />;
}
