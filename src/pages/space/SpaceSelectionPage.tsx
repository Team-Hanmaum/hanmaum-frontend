import { useAppNavigate } from "@/routes/useAppNavigate";
import { useLocation } from "react-router";
import { Header, PageLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
} from "@/components/feedback";
import { Button, IconButton } from "@/components/ui";
import type { CareSpaceSummary } from "@/features/carespace/api/careSpaceTypes";
import {
  CareSpaceList,
  type CareSpaceListItem,
} from "@/features/carespace/ui/CareSpaceList";
import { useCareSpaces } from "@/features/carespace/model/useCareSpaces";
import type { ApiError } from "@/lib/api";
import { accountPath, paths, spacePath, type SpaceTab } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

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
  const entry = location.state as {
    familyAction?: { kind: string; spaceId: string };
    fromSpace?: { id: string; tab: SpaceTab };
    fromAccount?: { spaceId: string | null };
  } | null;
  const familyAction = entry?.familyAction;
  const returnPath = entry?.fromSpace
    ? spacePath(entry.fromSpace.id, entry.fromSpace.tab)
    : entry?.fromAccount
      ? accountPath(entry.fromAccount.spaceId ?? undefined)
      : undefined;
  const onBack = useBackNavigation(returnPath ?? paths.spaces);
  const accountAction = (
    <IconButton
      icon="person"
      label="내 계정"
      title="내 계정"
      onClick={() => void navigate(paths.account)}
    />
  );
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
          returnPath ? (
            <Header
              variant="back"
              title="참여 공간 선택"
              onBack={onBack}
              actions={accountAction}
            />
          ) : (
            <Header
              variant="main"
              brandAction={{
                label: "한마음 시작 화면으로",
                onClick: () => void navigate(paths.landing),
              }}
              actions={accountAction}
            />
          )
        }
        footer={
          <FixedBottomArea position="fixed">
            <div className="flex justify-center px-hm-20 pt-hm-16 pb-[calc(var(--hm-spacing-24)+env(safe-area-inset-bottom))]">
              <Button
                variant="primary"
                className="min-h-hm-48 max-w-full border border-transparent px-hm-40 py-hm-10"
                onClick={() => void navigate(paths.onboardingGuide)}
              >
                돌봄 공간 만들기
              </Button>
            </div>
          </FixedBottomArea>
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
        <h1 className="text-hm-title-page">공간을 선택해 주세요</h1>
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
      </PageLayout>
    </>
  );
}
