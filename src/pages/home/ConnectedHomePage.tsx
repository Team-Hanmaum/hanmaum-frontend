import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { HomeContent } from "@/features/dashboard/ui/HomeContent";
import {
  isEmptyHome,
  toHomeView,
  toSpaceView,
} from "@/features/dashboard/model/homeData";
import { useHomeData } from "@/features/dashboard/model/useHomeData";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { ApiError } from "@/lib/api";
import {
  spacePath,
  spaceInvitePath,
  proposalListPath,
  paths,
  careListPath,
} from "@/routes/paths";
import { exampleNewsPath, exampleCarePath } from "@/routes/exampleDestinations";

export function ConnectedHomePage() {
  const { space } = useConnectedSpace();
  const navigate = useAppNavigate();
  const { dashboard, news } = useHomeData(space.spaceId);
  const members = useSpaceMembers(space.spaceId);
  const retry = () => {
    void dashboard.refetch();
    void news.refetch();
    void members.refetch();
  };
  const failed = dashboard.isError || news.isError || members.isError;
  const denied = [dashboard.error, news.error, members.error].some(
    (error) =>
      error instanceof ApiError && [403, 404].includes(error.status ?? 0),
  );
  if (denied)
    return (
      <ErrorState
        reason="no-permission"
        title="이 공간에 접근할 수 없어요"
        actionLabel="참여 공간 선택"
        onAction={() => void navigate(paths.spaces)}
      />
    );
  if (!dashboard.data || !news.data || !members.data)
    return failed ? (
      <ErrorState
        reason="load-error"
        title="홈을 불러오지 못했어요"
        onAction={retry}
      />
    ) : (
      <LoadingState label="홈을 불러오고 있어요" />
    );
  const empty = isEmptyHome(dashboard.data, news.data);
  return (
    <>
      {failed && (
        <Notice
          tone="error"
          title="최신 정보를 불러오지 못했어요"
          body="마지막으로 확인한 내용을 표시하고 있어요."
          action={{ label: "다시 불러오기", onClick: retry }}
        />
      )}
      <HomeContent
        connected
        space={{ ...toSpaceView(space, members.data), empty }}
        data={toHomeView(dashboard.data, news.data)}
        state={
          empty ? (members.data.length === 1 ? "created" : "empty") : "default"
        }
        onFamily={() => void navigate(spacePath(space.spaceId, "family"))}
        onInvite={() => void navigate(spaceInvitePath(space.spaceId))}
        onNews={() => void navigate(spacePath(space.spaceId, "news"))}
        onOpenNews={() => void navigate(exampleNewsPath(space.spaceId))}
        onCare={(filter) => void navigate(careListPath(space.spaceId, filter))}
        onOpenCare={(id) => {
          const kind = dashboard.data.remainingTasks.items.some(
            (item) => item.itemId === id,
          )
            ? "task"
            : dashboard.data.unconfirmedQuestions.items.some(
                  (item) => item.itemId === id,
                )
              ? "question"
              : "schedule";
          void navigate(exampleCarePath(space.spaceId, kind));
        }}
        onPending={() => void navigate(proposalListPath(space.spaceId))}
        onHistory={() =>
          void navigate(exampleCarePath(space.spaceId, "schedule", true))
        }
        onChange={() =>
          void navigate(exampleCarePath(space.spaceId, "schedule", true))
        }
        onRetry={retry}
      />
    </>
  );
}
