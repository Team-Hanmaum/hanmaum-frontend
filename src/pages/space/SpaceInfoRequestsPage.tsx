import { useSearchParams } from "react-router";
import { Button, MenuRow, Tabs } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import { ApiError } from "@/lib/api";
import {
  authorName,
  formatServerTime,
} from "@/features/careitem/model/careReadView";
import { useChangeRequests } from "@/features/proposal/model/useChangeRequests";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { spaceInfoPath, spaceInfoRequestPath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

const tabs = [
  { value: "requested", label: "승인 대기", status: "PENDING" },
  { value: "applied", label: "반영", status: "APPLIED" },
  { value: "rejected", label: "미적용", status: "DECLINED" },
  { value: "canceled", label: "취소", status: "CANCELED" },
  { value: "invalidated", label: "무효", status: "INVALIDATED" },
] as const;

export function SpaceInfoRequestsPage() {
  const { space } = useConnectedSpace();
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const [params, setParams] = useSearchParams();
  const tab =
    tabs.find((item) => item.value === params.get("status")) ?? tabs[0];
  const query = useChangeRequests(space.spaceId, tab.status);
  const back = useBackNavigation(withReturn(spaceInfoPath(space.spaceId)));
  const denied =
    query.error instanceof ApiError &&
    [403, 404].includes(query.error.status ?? 0);
  const visible =
    query.data?.pages
      .flatMap((page) => page.items)
      .filter(
        (request) =>
          request.entries.some(
            (entry) =>
              entry.action === "UPDATE_SPACE" && entry.status === tab.status,
          ) &&
          (space.role === "OWNER" ||
            request.submittedBy.membershipId === space.membershipId),
      ) ?? [];
  const contents =
    !query.data || denied ? (
      <ReviewQueryState
        error={query.error}
        retry={() => void query.refetch()}
      />
    ) : (
      <div className="flex flex-col gap-hm-12">
        {query.isError && (
          <Notice
            tone="error"
            title="목록을 새로 확인하지 못했어요"
            body="표시된 내용이 최신 상태가 아닐 수 있어요."
            action={{ label: "다시 확인", onClick: () => void query.refetch() }}
          />
        )}
        {visible.map((request) => (
          <MenuRow
            key={request.requestId}
            icon="edit"
            title="돌봄 대상 호칭 수정 요청"
            description={`${authorName(request.submittedBy)} · ${formatServerTime(request.submittedAt)}`}
            onClick={() =>
              void navigate(
                withReturn(
                  spaceInfoRequestPath(space.spaceId, request.requestId),
                ),
              )
            }
          />
        ))}
        {!visible.length && (
          <EmptyState
            title={
              query.hasNextPage
                ? "지금 불러온 목록에는 공간 정보 요청이 없어요"
                : "표시할 요청이 없어요"
            }
            body={
              query.hasNextPage
                ? "더 보기를 눌러 이전 요청을 확인해 주세요."
                : "가족이 보낸 수정 요청과 처리 결과를 여기에서 확인할 수 있어요."
            }
          />
        )}
        {query.hasNextPage && (
          <Button
            variant="secondary"
            loading={query.isFetchingNextPage}
            disabled={query.isFetching}
            onClick={() => void query.fetchNextPage()}
          >
            이전 요청 더 보기
          </Button>
        )}
      </div>
    );
  return (
    <AccountPageLayout
      connected
      title={space.role === "OWNER" ? "공간 정보 요청" : "내 공간 정보 요청"}
      onBack={back}
      spaceId={space.spaceId}
    >
      <h1 className="text-hm-title-page">공간 정보 수정 요청</h1>
      <p className="text-hm-body-small text-hm-text-secondary">
        가족이 요청한 이름 변경과 처리 결과를 확인해요.
      </p>
      <Tabs
        label="처리 상태"
        value={tab.value}
        onValueChange={(value) =>
          void setParams((previous) => {
            const next = new URLSearchParams(previous);
            next.set("status", value);
            return next;
          })
        }
        items={tabs.map((item) => ({
          ...item,
          content: item.value === tab.value ? contents : null,
        }))}
      />
    </AccountPageLayout>
  );
}
