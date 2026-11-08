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
import {
  spacePath,
  spaceInvitePath,
  newsDetailPath,
  careItemPath,
  proposalListPath,
  careHistoryPath,
} from "@/routes/paths";

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
        onOpenNews={(id) => void navigate(newsDetailPath(space.spaceId, id))}
        onCare={() => void navigate(spacePath(space.spaceId, "care"))}
        onOpenCare={(id) => void navigate(careItemPath(space.spaceId, id))}
        onPending={() => void navigate(proposalListPath(space.spaceId))}
        onHistory={() =>
          void navigate(`${spacePath(space.spaceId, "care")}/history`)
        }
        onChange={(id) => {
          const [itemId, version] = id.split(":");
          void navigate(careHistoryPath(space.spaceId, itemId, version));
        }}
        onRetry={retry}
      />
    </>
  );
}
