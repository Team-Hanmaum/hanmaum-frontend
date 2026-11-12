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
import { ExampleResultNotice } from "@/components/feedback/ExampleResultNotice";
import { MenuRow } from "@/components/ui";
import type { CareSpaceSummary } from "@/features/carespace/api/careSpaceTypes";
import {
  CareSpaceList,
  type CareSpaceListItem,
} from "@/features/carespace/ui/CareSpaceList";
import { useCareSpaces } from "@/features/carespace/model/useCareSpaces";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { mockCareSpaces } from "@/features/carespace/model/mockCareSpaces";
import type { ApiError } from "@/lib/api";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { paths, spacePath } from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";

const states = [
  { value: "default", label: "참여 공간 있음" },
  { value: "empty", label: "참여 공간 없음" },
  { value: "loading", label: "불러오는 중" },
  { value: "error", label: "조회 오류" },
] as const;

function toListItem(space: CareSpaceSummary): CareSpaceListItem {
  return {
    id: space.spaceId,
    subjectLabel: space.subjectLabel,
    role: space.role === "OWNER" ? "owner" : "member",
    memberCount: space.memberCount,
  };
}

function SpaceListError({
  error,
  retrying,
  onRetry,
  onLogin,
}: {
  error: ApiError | null;
  retrying: boolean;
  onRetry: () => void;
  onLogin: () => void;
}) {
  if (error?.status === 401 && error.code === "UNAUTHENTICATED")
    return (
      <ErrorState
        reason="no-permission"
        title="로그인이 필요해요"
        body="로그인한 뒤 참여 중인 돌봄 공간을 확인할 수 있어요."
        actionLabel="로그인하기"
        onAction={onLogin}
      />
    );
  return (
    <ErrorState
      reason={error?.kind === "network" ? "offline" : "load-error"}
      loading={retrying}
      onAction={onRetry}
    />
  );
}

export function SpaceSelectionPage() {
  const navigate = useAppNavigate();
  const mock = useMockCareSpaces();
  const remote = useCareSpaces();
  const spaces: CareSpaceListItem[] = isMockPreviewEnabled
    ? mock.spaces.map((space) => ({
        ...space,
        memberCount: space.members.length,
      }))
    : (remote.data?.map(toListItem) ?? []);
  const currentId = isMockPreviewEnabled ? mock.currentId : undefined;
  const currentSpace = spaces.find((space) => space.id === currentId);
  const location = useLocation();
  const familyAction = (
    location.state as {
      familyAction?: { kind: string; spaceId: string };
    } | null
  )?.familyAction;
  const endedParticipation =
    !isMockPreviewEnabled &&
    remote.isSuccess &&
    !remote.isFetching &&
    typeof familyAction?.spaceId === "string" &&
    familyAction.spaceId.length > 0 &&
    (familyAction.kind === "left" || familyAction.kind === "deleted")
      ? familyAction
      : undefined;
  const participatingAgain =
    endedParticipation?.kind === "left" &&
    spaces.some((space) => space.id === endedParticipation.spaceId);
  const exit =
    mock.lastExit?.id ===
    (location.state as { familyExit?: string } | null)?.familyExit
      ? mock.lastExit
      : undefined;
  const [mockState, setMockState] = useMockScreenState(states, "default");
  // 실제 조회는 Query 상태를 그대로 사용하고 Mock 상태 선택은 무시한다.
  const state = isMockPreviewEnabled
    ? mockState
    : remote.isPending
      ? "loading"
      : remote.isError
        ? "error"
        : "default";
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
          isMockPreviewEnabled && (
            <MockStateSelect
              message="예시 공간 · 실제 참여·조회 없음 · 새로고침 시 초기화"
              value={mockState}
              options={states}
              onChange={setMockState}
            />
          )
        }
      >
        {endedParticipation && (
          <Notice
            title={
              endedParticipation.kind === "deleted"
                ? "공간을 삭제했어요"
                : participatingAgain
                  ? "이전 참여 종료를 확인했어요"
                  : "공간에서 나왔어요"
            }
            body={
              participatingAgain
                ? "현재 다시 참여 중인 공간은 목록에 표시돼요."
                : "현재 참여 중인 공간은 아래 목록에서 확인해 주세요."
            }
          />
        )}
        {exit && (
          <ExampleResultNotice
            title={
              exit.reason === "left"
                ? `${exit.name}에서 나왔어요`
                : `${exit.name}을 삭제했어요`
            }
            body="예시 나가기·삭제 흐름을 확인했어요."
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
          isMockPreviewEnabled ? (
            <ErrorState
              reason="load-error"
              onAction={() => setMockState("default")}
            />
          ) : (
            <SpaceListError
              error={remote.error}
              retrying={remote.isFetching}
              onRetry={() => void remote.refetch()}
              onLogin={() => void navigate(paths.login)}
            />
          )
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
              if (isMockPreviewEnabled) mockCareSpaces.select(id);
              void navigate(spacePath(id));
            }}
          />
        )}
        <MenuRow
          icon="plus"
          title="돌봄 공간 만들기"
          description="새로운 돌봄 공간이 필요할 때"
          onClick={() =>
            void navigate(
              isMockPreviewEnabled ? paths.spaceCreate : paths.onboardingGuide,
            )
          }
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
