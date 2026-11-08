import { useLocation } from "react-router";
import { DetailLayout } from "@/components/layout";
import { EmptyState } from "@/components/feedback";
import { MenuRow } from "@/components/ui";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { paths, accountPath, spacePath } from "@/routes/paths";

export function SpacePendingContent() {
  return (
    <EmptyState
      title="아직 준비 중인 기능이에요"
      body="이 화면은 실제 데이터 연결을 준비하고 있어요. 돌봄 현황은 홈에서 확인할 수 있어요."
    />
  );
}
export function SpacePendingPage() {
  const { space } = useConnectedSpace();
  const navigate = useAppNavigate();
  const { pathname } = useLocation();
  const title = pathname.includes("/news")
    ? "가족 소식"
    : pathname.includes("/invite")
      ? "가족 초대"
      : "돌봄 정보";
  return (
    <DetailLayout
      title={title}
      onBack={() => void navigate(spacePath(space.spaceId))}
    >
      <SpacePendingContent />
    </DetailLayout>
  );
}
export function ConnectedAllPage() {
  const { space } = useConnectedSpace();
  const navigate = useAppNavigate();
  return (
    <>
      <h1 className="text-hm-title-page">전체</h1>
      <MenuRow
        icon="person"
        title="내 계정"
        onClick={() => void navigate(accountPath(space.spaceId))}
      />
      <MenuRow
        icon="grid-brand"
        title="참여 공간 선택"
        onClick={() => void navigate(paths.spaces)}
      />
      <MenuRow
        icon="info-brand"
        title="돌봄 공간 정보"
        description={`${space.subjectLabel}의 돌봄 · ${space.memberCount}명`}
        onClick={() =>
          void navigate(
            `${paths.spaces}/${encodeURIComponent(space.spaceId)}/info`,
          )
        }
      />
    </>
  );
}
