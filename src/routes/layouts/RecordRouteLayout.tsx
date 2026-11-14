import { Outlet, useParams } from "react-router";
import { useConnectedSpace } from "../useConnectedSpace";

// 소식 ID가 바뀌면 작성·상세 화면의 로컬 상태를 초기화한다.
export function RecordRouteLayout() {
  const { careSpaceId, recordId } = useParams();
  const context = useConnectedSpace();
  return (
    <Outlet
      key={`${careSpaceId}:${recordId ?? "new"}`}
      context={context}
    />
  );
}
