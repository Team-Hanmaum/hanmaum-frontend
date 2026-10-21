import { useAppNavigate } from "@/routes/useAppNavigate";
import { AppLink } from "@/routes/AppLink";
import { useLocation } from "react-router";
import { Header, PageLayout } from "@/components/layout";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
} from "@/components/feedback";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import { MenuRow } from "@/components/ui";
import { CareSpaceList } from "@/features/carespace/ui/CareSpaceList";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { mockCareSpaces } from "@/features/carespace/model/mockCareSpaces";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { paths, spacePath } from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";

const states = [
  { value: "default", label: "참여 공간 있음" },
  { value: "empty", label: "참여 공간 없음" },
  { value: "loading", label: "불러오는 중" },
  { value: "error", label: "조회 오류" },
] as const;
export function SpaceSelectionPage() {
  const navigate = useAppNavigate();
  const { spaces, currentId, lastExit } = useMockCareSpaces();
  const currentSpace = spaces.find((space) => space.id === currentId);
  const location = useLocation();
  const exit =
    lastExit?.id ===
    (location.state as { familyExit?: string } | null)?.familyExit
      ? lastExit
      : undefined;
  const [state, setState] = useMockScreenState(states, "default");
  return (
    <>
      <PageLayout
        header={
          <Header
            variant="main"
            brandAction={{
              label: currentSpace ? "한마음 홈으로" : "한마음 시작 화면으로",
              onClick: () =>
                void navigate(
                  currentSpace ? spacePath(currentSpace.id) : paths.landing,
                ),
            }}
          />
        }
        notice={
          <MockStateSelect
            message="예시 공간 · 실제 참여·조회 없음 · 새로고침 시 초기화"
            value={state}
            options={states}
            onChange={setState}
          />
        }
      >
        {exit && (
          <Notice
            role="status"
            title={
              exit.reason === "left"
                ? `${exit.name}에서 나왔어요`
                : `${exit.name}을 삭제했어요`
            }
            body="이제 다른 참여 공간을 선택할 수 있어요."
          />
        )}
        <h1 className="text-hm-title-page">
          어느 공간으로
          <br />
          들어갈까요?
        </h1>
        {state === "loading" ? (
          <LoadingState label="참여 공간을 불러오고 있어요" />
        ) : state === "error" ? (
          <ErrorState
            reason="load-error"
            onAction={() => setState("default")}
          />
        ) : state === "empty" || spaces.length === 0 ? (
          <EmptyState
            title="아직 참여한 공간이 없어요"
            body="새로운 돌봄 공간을 만들거나 가족의 초대 링크로 참여해 주세요."
            icon="home-brand"
          />
        ) : (
          <CareSpaceList
            spaces={spaces}
            currentId={currentId}
            onSelect={(id) => {
              mockCareSpaces.select(id);
              void navigate(spacePath(id));
            }}
          />
        )}
        <MenuRow
          icon="plus"
          title="돌봄 공간 만들기"
          description="새로운 돌봄 공간이 필요할 때"
          disabled={!isMockPreviewEnabled}
          onClick={() => void navigate(paths.spaceCreate)}
        />
        <p className="text-hm-body-small text-hm-text-secondary">
          초대받은 링크가 있다면 그 링크로 가족의 공간에 참여해 주세요.
        </p>
        <MenuRow
          icon="person"
          title="내 계정"
          onClick={() => void navigate(paths.account)}
        />
        {isMockPreviewEnabled && (
          <AppLink
            to={paths.invitationExample}
            className="hm-focus-ring rounded-hm-8 p-hm-12 text-center text-hm-body-small text-hm-text-brand underline"
          >
            Mock 초대 참여 예시 보기
          </AppLink>
        )}
      </PageLayout>
    </>
  );
}
