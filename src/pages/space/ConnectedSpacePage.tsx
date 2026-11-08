import { useLocation } from "react-router";
import { Header, PageLayout } from "@/components/layout";
import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { MenuRow } from "@/components/ui";
import { useCareSpaces } from "@/features/carespace/model/useCareSpaces";
import { paths, spacePath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";

export function ConnectedSpacePage({ spaceId }: { spaceId: string }) {
  const spaces = useCareSpaces();
  const navigate = useAppNavigate();
  const { pathname } = useLocation();
  const space = spaces.data?.find((value) => value.spaceId === spaceId);
  const toSpaces = () => void navigate(paths.spaces);
  return (
    <PageLayout
      header={
        <Header
          variant="main"
          brandAction={{
            label: "한마음 홈으로",
            onClick: () => void navigate(spacePath(spaceId)),
          }}
        />
      }
    >
      {spaces.isPending ? (
        <LoadingState label="참여 공간을 확인하고 있어요" />
      ) : spaces.isError ? (
        <ErrorState
          reason="load-error"
          onAction={() => void spaces.refetch()}
          loading={spaces.isFetching}
        />
      ) : !space ? (
        <ErrorState
          reason="no-permission"
          onAction={toSpaces}
        />
      ) : (
        <>
          <h1 className="text-hm-title-page">{space.subjectLabel}의 돌봄</h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            함께 돌보는 가족 {space.memberCount}명 ·{" "}
            {space.role === "OWNER" ? "소유자" : "구성원"}
          </p>
          <Notice
            title={
              pathname === spacePath(spaceId)
                ? "돌봄 공간에 들어왔어요"
                : "아직 준비 중인 기능이에요"
            }
            body="돌봄 정보와 소식 화면을 준비하고 있어요. 현재는 참여 공간과 내 계정을 확인할 수 있어요."
          />
        </>
      )}
      <MenuRow
        icon="grid-brand"
        title="참여 공간 선택"
        onClick={toSpaces}
      />
      <MenuRow
        icon="person"
        title="내 계정"
        onClick={() => void navigate(paths.account)}
      />
    </PageLayout>
  );
}
