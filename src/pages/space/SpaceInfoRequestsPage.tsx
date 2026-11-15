import { useSearchParams } from "react-router";
import { Button, MenuRow, Tabs } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { ApiError } from "@/lib/api";
import {
  authorName,
  formatServerTime,
} from "@/features/careitem/model/careReadView";
import { useChangeRequests } from "@/features/proposal/model/useChangeRequests";
import { requestFilterLabels } from "@/features/proposal/model/reviewLabels";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { spaceInfoPath, spaceInfoRequestPath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

const tabs = [
  { value: "requested", status: "PENDING" },
  { value: "applied", status: "APPLIED" },
  { value: "rejected", status: "DECLINED" },
  { value: "canceled", status: "CANCELED" },
  { value: "invalidated", status: "INVALIDATED" },
] as const;

export function SpaceInfoRequestsPage() {
  const { space } = useSpaceContext();
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
  const visible = [
    ...new Map(
      (query.data?.pages.flatMap((page) => page.items) ?? []).map((request) => [
        request.requestId,
        request,
      ]),
    ).values(),
  ].filter(
    (request) =>
      request.entries.some(
        (entry) =>
          entry.action === "UPDATE_SPACE" && entry.status === tab.status,
      ) &&
      (space.role === "OWNER" ||
        request.submittedBy.membershipId === space.membershipId),
  );
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
        {visible.length > 0 ? (
          <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
            {visible.map((request) => (
              <MenuRow
                key={request.requestId}
                icon={null}
                className="min-h-hm-touch-min rounded-none py-hm-12 first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle"
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
          </div>
        ) : (
          <p
            role="status"
            className="py-hm-16 text-hm-body-small text-hm-text-secondary"
          >
            {query.hasNextPage
              ? "지금 불러온 목록에는 공간 정보 요청이 없어요."
              : "이 상태의 요청이 없어요."}
          </p>
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
      title={space.role === "OWNER" ? "공간 정보 요청" : "내 공간 정보 요청"}
      onBack={back}
      spaceId={space.spaceId}
    >
      <h1 className="text-hm-title-page">공간 정보 수정 요청</h1>
      <Tabs
        label="처리 상태"
        variant="pill"
        tabClassName="whitespace-nowrap px-hm-8"
        value={tab.value}
        onValueChange={(value) =>
          void setParams(
            (previous) => {
              const next = new URLSearchParams(previous);
              next.set("status", value);
              return next;
            },
            { replace: true },
          )
        }
        items={tabs.map((item) => ({
          ...item,
          label: requestFilterLabels[item.status],
          content: item.value === tab.value ? contents : null,
        }))}
      />
    </AccountPageLayout>
  );
}
