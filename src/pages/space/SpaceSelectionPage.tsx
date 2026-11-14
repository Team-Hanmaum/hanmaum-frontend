import { useAppNavigate } from "@/routes/useAppNavigate";
import { useLocation } from "react-router";
import { Header, PageLayout } from "@/components/layout";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
} from "@/components/feedback";
import { MenuRow } from "@/components/ui";
import type { CareSpaceSummary } from "@/features/carespace/api/careSpaceTypes";
import {
  CareSpaceList,
  type CareSpaceListItem,
} from "@/features/carespace/ui/CareSpaceList";
import { useCareSpaces } from "@/features/carespace/model/useCareSpaces";
import type { ApiError } from "@/lib/api";
import { paths, spacePath } from "@/routes/paths";

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
  const remote = useCareSpaces();
  const spaces = remote.data?.map(toListItem) ?? [];
  const location = useLocation();
  const familyAction = (
    location.state as {
      familyAction?: { kind: string; spaceId: string };
    } | null
  )?.familyAction;
  const endedParticipation =
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
  return (
    <>
      <PageLayout
        header={
          <Header
            variant="main"
            brandAction={{
              label: "한마음 시작 화면으로",
              onClick: () => void navigate(paths.landing),
            }}
          />
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
        <h1 className="text-hm-title-page">
          어느 공간으로
          <br />
          들어갈까요?
        </h1>
        {remote.isPending ? (
          <LoadingState label="참여 공간을 불러오고 있어요" />
        ) : remote.isError ? (
          <SpaceListError
            error={remote.error}
            retrying={remote.isFetching}
            onRetry={() => void remote.refetch()}
            onLogin={() => void navigate(paths.login)}
          />
        ) : spaces.length === 0 ? (
          <EmptyState
            title="아직 참여한 공간이 없어요"
            body="새로운 돌봄 공간을 만들거나 가족의 초대 링크로 참여해 주세요."
            icon="home-brand"
          />
        ) : (
          <CareSpaceList
            spaces={spaces}
            onSelect={(id) => {
              void navigate(spacePath(id));
            }}
          />
        )}
        <MenuRow
          icon="plus"
          title="돌봄 공간 만들기"
          description="새로운 돌봄 공간이 필요할 때"
          onClick={() => void navigate(paths.onboardingGuide)}
        />
        <p className="text-hm-body-small text-hm-text-secondary">
          초대받은 링크가 있다면 그 링크로 가족의 공간에 참여해 주세요.
        </p>
        <MenuRow
          icon="person"
          title="내 계정"
          onClick={() => void navigate(paths.account)}
        />
      </PageLayout>
    </>
  );
}
