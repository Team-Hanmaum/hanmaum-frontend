import { ErrorState, Notice } from "@/components/feedback";
import { useRecordList } from "@/features/record/model/useRecords";
import { toRecordView } from "@/features/record/model/recordView";
import type { NewsListState } from "@/features/record/model/newsScreenStates";
import { NewsList } from "@/features/record/ui/NewsList";
import { ApiError } from "@/lib/api";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import {
  newsCreatePath,
  newsDetailPath,
  paths,
  proposalListPath,
} from "@/routes/paths";

export function ConnectedNewsPage() {
  const { space } = useConnectedSpace();
  const navigate = useAppNavigate();
  const list = useRecordList(space.spaceId);
  const denied =
    list.error instanceof ApiError &&
    [403, 404].includes(list.error.status ?? 0);
  if (denied)
    return (
      <ErrorState
        reason="no-permission"
        title="이 공간에 접근할 수 없어요"
        actionLabel="참여 공간 선택"
        onAction={() => void navigate(paths.spaces)}
      />
    );
  // 커서 사이에 같은 소식이 다시 내려와도 한 번만 표시한다.
  const seen = new Set<string>();
  const records = (list.data?.pages ?? [])
    .flatMap((page) => page.items)
    .filter((item) => !seen.has(item.recordId) && seen.add(item.recordId))
    .map((item) => toRecordView(item, space.spaceId));
  const state: NewsListState = list.isPending
    ? "loading"
    : !list.data
      ? "error"
      : list.isFetchNextPageError
        ? "more-error"
        : records.length
          ? "default"
          : "empty";
  return (
    <>
      {list.isRefetchError && (
        <Notice
          tone="error"
          title="최신 소식을 불러오지 못했어요"
          body="마지막으로 확인한 소식을 표시하고 있어요."
          action={{
            label: "다시 불러오기",
            onClick: () => void list.refetch(),
          }}
        />
      )}
      <NewsList
        records={records}
        state={state}
        visibleCount={records.length}
        paging={{
          hasNext: list.hasNextPage,
          loading: list.isFetchingNextPage,
        }}
        onMore={() => void list.fetchNextPage()}
        pendingCount={0}
        onCreate={() => void navigate(newsCreatePath(space.spaceId))}
        onOpen={(id) => void navigate(newsDetailPath(space.spaceId, id))}
        onReview={() => void navigate(proposalListPath(space.spaceId))}
        onRetry={() => void list.refetch()}
      />
    </>
  );
}
