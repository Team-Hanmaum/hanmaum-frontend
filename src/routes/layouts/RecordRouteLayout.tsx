import { Outlet, useNavigate, useParams } from "react-router";
import { DetailLayout } from "@/components/layout";
import { ErrorState } from "@/components/feedback";
import { MockNotice } from "@/components/feedback/MockNotice";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { paths } from "../paths";
import { SpaceAccessState } from "./SpaceAccessState";

// 작성·상세에서 공간을 검증하고, 공간/소식 전환 시 진행 중인 Mock 동작을 해제한다.
export function RecordRouteLayout() {
  const { careSpaceId, recordId } = useParams();
  const { spaces, ended } = useMockCareSpaces();
  const navigate = useNavigate();
  const space = spaces.find((item) => item.id === careSpaceId);
  if (careSpaceId && ended[careSpaceId]) return <SpaceAccessState />;
  if (!isMockPreviewEnabled || !space)
    return (
      <DetailLayout
        title="소식"
        onBack={() => void navigate(paths.spaces)}
        notice={<MockNotice message="실제 공간 조회·권한 확인 연결 전" />}
      >
        <h1 className="sr-only">소식</h1>
        <ErrorState
          reason="load-error"
          title="화면 확인용 공간이 없어요"
          body="새로고침하면 직접 만든 Mock 공간은 초기화돼요. 예시 공간을 선택해 주세요."
          actionLabel="공간 선택으로"
          onAction={() => void navigate(paths.spaces)}
        />
      </DetailLayout>
    );
  return (
    <Outlet
      key={`${space.id}:${recordId ?? "new"}`}
      context={space}
    />
  );
}
