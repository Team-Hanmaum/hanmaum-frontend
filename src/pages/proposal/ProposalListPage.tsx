import { useSearchParams } from "react-router";
import { Badge, Button, MenuRow, Tabs } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { useProposalList } from "@/features/proposal/model/useProposalQueries";
import { useChangeRequests } from "@/features/proposal/model/useChangeRequests";
import {
  actionLabels,
  requestFilterLabels,
} from "@/features/proposal/model/reviewLabels";
import type {
  ProposalStatus,
  ProposalSummary,
} from "@/features/proposal/api/proposalReadTypes";
import type { RequestStatus } from "@/features/proposal/api/changeRequestTypes";
import {
  authorName,
  formatServerTime,
} from "@/features/careitem/model/careReadView";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import {
  spacePath,
  spaceTabs,
  proposalReviewPath,
  proposalRequestPath,
  proposalResultPath,
  spaceInfoRequestsPath,
  spaceInfoRequestPath,
  type SpaceTab,
} from "@/routes/paths";
const resultTabs = [
  { value: "applied", label: "반영됨", status: "APPLIED" },
  { value: "rejected", label: "미반영", status: "DECLINED" },
  { value: "invalidated", label: "무효", status: "INVALIDATED" },
] as const satisfies readonly {
  value: string;
  label: string;
  status: ProposalStatus;
}[];

export function ProposalListPage() {
  const { space } = useSpaceContext();
  const [params, setParams] = useSearchParams();
  const status = params.get("status");
  const fromTab = params.get("fromTab");
  const sourceTab = spaceTabs.find((tab) => tab === fromTab) ?? "news";
  const result = resultTabs.find((tab) => tab.value === status);
  const activeTab = result
    ? "results"
    : status === "requests"
      ? "requests"
      : "review";
  const { withReturn } = useWithdrawalReturn();
  const back = useBackNavigation(
    withReturn(spacePath(space.spaceId, sourceTab)),
  );

  function selectStatus(value: string) {
    if (value === status) return;
    const next = new URLSearchParams(params);
    next.set("status", value);
    void setParams(next, { replace: true });
  }

  return (
    <ProposalPageLayout
      title="제안·요청"
      spaceId={space.spaceId}
      onBack={back}
      tabs
      activeTab={sourceTab}
    >
      <h1 className="sr-only">제안·요청</h1>
      <Tabs
        label="제안·요청 종류"
        variant="underline"
        value={activeTab}
        onValueChange={(value) => {
          if (value !== activeTab)
            selectStatus(value === "results" ? resultTabs[0].value : value);
        }}
        items={[
          {
            value: "review",
            label: "검토",
            content:
              activeTab === "review" ? (
                <ProposalList
                  spaceId={space.spaceId}
                  status="REVIEW_PENDING"
                  sourceTab={sourceTab}
                />
              ) : null,
          },
          {
            value: "requests",
            label: "가족 요청",
            content:
              activeTab === "requests" ? (
                <RequestList spaceId={space.spaceId} />
              ) : null,
          },
          {
            value: "results",
            label: "결과",
            content: result ? (
              <Tabs
                label="제안 결과 상태"
                variant="pill"
                value={result.value}
                onValueChange={selectStatus}
                items={resultTabs.map((tab) => ({
                  ...tab,
                  content:
                    tab.value === result.value ? (
                      <ProposalList
                        spaceId={space.spaceId}
                        status={tab.status}
                        sourceTab={sourceTab}
                      />
                    ) : null,
                }))}
              />
            ) : null,
          },
        ]}
      />
    </ProposalPageLayout>
  );
}
function ProposalList({
  spaceId,
  status,
  sourceTab,
}: {
  spaceId: string;
  status: ProposalStatus;
  sourceTab: SpaceTab;
}) {
  const list = useProposalList(spaceId, status);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  if (!list.data || Boolean(list.isRefetchError))
    return (
      <ReviewQueryState
        error={list.error}
        retry={() => void list.refetch()}
      />
    );
  const items = [
    ...new Map(
      list.data.pages.flatMap((p) => p.items).map((p) => [p.proposalId, p]),
    ).values(),
  ];
  const rows = new Map<string, { proposal: ProposalSummary; count: number }>();
  for (const proposal of items) {
    const key =
      proposal.status === "REVIEW_PENDING"
        ? proposal.recordId
        : proposal.proposalId;
    const row = rows.get(key);
    if (row) row.count += 1;
    else rows.set(key, { proposal, count: 1 });
  }
  return (
    <div className="flex flex-col gap-hm-12">
      {rows.size ? (
        <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
          {[...rows].map(([key, { proposal: p, count }]) => (
            <MenuRow
              key={key}
              icon={null}
              className="min-h-hm-touch-min! rounded-none py-hm-12 first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle focus-visible:z-10"
              title={p.title ?? "내용이 제거된 제안"}
              description={
                count > 1
                  ? formatServerTime(p.createdAt)
                  : `${actionLabels[p.action]} · ${formatServerTime(p.createdAt)}`
              }
              trailing={
                p.status === "REVIEW_PENDING" && (
                  <Badge
                    className="shrink-0"
                    label={`${list.hasNextPage ? "불러온 " : ""}${count}건`}
                    tone="brand"
                  />
                )
              }
              onClick={() =>
                void navigate(
                  withReturn(
                    p.status === "REVIEW_PENDING"
                      ? proposalReviewPath(spaceId, p.recordId)
                      : proposalResultPath(spaceId, p.proposalId, sourceTab),
                  ),
                )
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="표시할 제안이 없어요"
          body="소식 분석으로 만들어진 제안을 이곳에서 확인할 수 있어요."
        />
      )}
      {list.isFetchNextPageError && (
        <ReviewQueryState
          error={list.error}
          retry={() => void list.fetchNextPage()}
        />
      )}
      {list.hasNextPage && (
        <Button
          variant="secondary"
          loading={list.isFetchingNextPage}
          onClick={() => void list.fetchNextPage()}
        >
          더 보기
        </Button>
      )}
    </div>
  );
}
function RequestList({ spaceId }: { spaceId: string }) {
  const [params, setParams] = useSearchParams();
  const filters = Object.keys(requestFilterLabels) as RequestStatus[];
  const status =
    filters.find((s) => s === params.get("requestStatus")) ?? "PENDING";
  const list = useChangeRequests(spaceId, status);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const content = (
    <div className="flex flex-col gap-hm-12">
      {!list.data || Boolean(list.isRefetchError) ? (
        <ReviewQueryState
          error={list.error}
          retry={() => void list.refetch()}
        />
      ) : items.length ? (
        <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
          {[...new Map(items.map((r) => [r.requestId, r])).values()].map(
            (r) => (
              <MenuRow
                key={r.requestId}
                icon={null}
                className="min-h-hm-touch-min rounded-none py-hm-12 first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle"
                title={`${authorName(r.submittedBy)}님의 요청`}
                description={`${formatServerTime(r.submittedAt)} · ${r.entries.filter((entry) => entry.status === status).length}건`}
                onClick={() =>
                  void navigate(
                    withReturn(
                      r.entries.every(
                        (entry) => entry.action === "UPDATE_SPACE",
                      )
                        ? spaceInfoRequestPath(spaceId, r.requestId)
                        : proposalRequestPath(spaceId, r.requestId),
                    ),
                  )
                }
              />
            ),
          )}
        </div>
      ) : (
        <EmptyState
          title="표시할 요청이 없어요"
          body="구성원이 제출한 요청의 상태를 확인할 수 있어요."
        />
      )}
      {list.isFetchNextPageError && (
        <ReviewQueryState
          error={list.error}
          retry={() => void list.fetchNextPage()}
        />
      )}
      {list.hasNextPage && (
        <Button
          variant="secondary"
          loading={list.isFetchingNextPage}
          onClick={() => void list.fetchNextPage()}
        >
          더 보기
        </Button>
      )}
    </div>
  );
  return (
    <div className="flex flex-col gap-hm-16">
      <MenuRow
        icon={null}
        className="min-h-hm-touch-min py-hm-12 hover:bg-hm-bg-subtle"
        title="공간 정보 수정 요청"
        onClick={() =>
          void navigate(withReturn(spaceInfoRequestsPath(spaceId)))
        }
      />
      <Tabs
        label="가족 요청 상태"
        variant="pill"
        tabClassName="whitespace-nowrap px-hm-8"
        value={status}
        onValueChange={(value) => {
          if (value === status) return;
          const next = new URLSearchParams(params);
          next.set("requestStatus", value);
          void setParams(next, { replace: true });
        }}
        items={filters.map((value) => ({
          value,
          label: requestFilterLabels[value],
          content: value === status ? content : null,
        }))}
      />
    </div>
  );
}
