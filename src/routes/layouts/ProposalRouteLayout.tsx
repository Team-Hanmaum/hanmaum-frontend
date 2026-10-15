import { Outlet, useNavigate, useParams } from "react-router";
import { DetailLayout } from "@/components/layout";
import { ErrorState } from "@/components/feedback";
import { MockNotice } from "@/components/feedback/MockNotice";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { paths } from "../paths";

export function ProposalRouteLayout() {
  const { careSpaceId, recordId, requestId, resultId, proposalId, itemId } =
    useParams();
  const { spaces } = useMockCareSpaces();
  const navigate = useNavigate();
  const space = spaces.find((item) => item.id === careSpaceId);
  if (!isMockPreviewEnabled || !space)
    return (
      <DetailLayout
        title="확인할 내용"
        onBack={() => void navigate(paths.spaces)}
        notice={<MockNotice message="실제 공간 조회·권한 확인 연결 전" />}
      >
        <ErrorState
          reason="load-error"
          title="화면 확인용 공간이 없어요"
          body="예시 공간을 선택해 주세요. 새로고침하면 직접 만든 Mock 공간은 초기화돼요."
          actionLabel="공간 선택으로"
          onAction={() => void navigate(paths.spaces)}
        />
      </DetailLayout>
    );
  return (
    <Outlet
      key={`${space.id}:${recordId ?? requestId ?? resultId ?? proposalId ?? itemId ?? "list"}`}
      context={space}
    />
  );
}
