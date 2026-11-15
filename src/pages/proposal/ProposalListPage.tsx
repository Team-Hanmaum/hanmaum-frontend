import { useSearchParams } from "react-router";
import { Button, MenuRow, Tabs } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { useProposalList } from "@/features/proposal/model/useProposalQueries";
import { useChangeRequests } from "@/features/proposal/model/useChangeRequests";
import {
  actionLabels,
  requestStatusLabels,
} from "@/features/proposal/model/reviewLabels";
import type { ProposalStatus } from "@/features/proposal/api/proposalReadTypes";
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
  proposalReviewPath,
  proposalRequestPath,
  proposalResultPath,
  spaceInfoRequestsPath,
  spaceInfoRequestPath,
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
  const sourceTab = params.get("fromTab") === "care" ? "care" : "news";
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
    void setParams(next);
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
}: {
  spaceId: string;
  status: ProposalStatus;
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
  return (
    <div className="flex flex-col gap-hm-12">
      {items.length ? (
        <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
          {items.map((p) => (
            <MenuRow
              key={p.proposalId}
              icon={null}
              className="min-h-hm-touch-min! rounded-none py-hm-12 first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle focus-visible:z-10"
              title={p.title ?? "내용이 제거된 제안"}
              description={`${actionLabels[p.action]} · ${formatServerTime(p.createdAt)}`}
              onClick={() =>
                void navigate(
                  withReturn(
                    p.status === "REVIEW_PENDING"
                      ? proposalReviewPath(spaceId, p.recordId)
                      : proposalResultPath(spaceId, p.proposalId),
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
  const status =
    (
      ["PENDING", "APPLIED", "DECLINED", "CANCELED", "INVALIDATED"] as const
    ).find((s) => s === params.get("requestStatus")) ?? "PENDING";
  const list = useChangeRequests(spaceId, status);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <div className="flex flex-col gap-hm-16">
      <MenuRow
        icon={null}
        className="min-h-hm-touch-min! py-hm-12 hover:bg-hm-bg-subtle"
        title="공간 정보 수정 요청"
        onClick={() =>
          void navigate(withReturn(spaceInfoRequestsPath(spaceId)))
        }
      />
      <label className="flex flex-col gap-hm-8">
        요청 상태
        <select
          className="hm-field-control"
          value={status}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            next.set("requestStatus", e.target.value);
            void setParams(next);
          }}
        >
          {(Object.keys(requestStatusLabels) as RequestStatus[]).map((s) => (
            <option
              key={s}
              value={s}
            >
              {requestStatusLabels[s]}
            </option>
          ))}
        </select>
      </label>
      {!list.data || Boolean(list.isRefetchError) ? (
        <ReviewQueryState
          error={list.error}
          retry={() => void list.refetch()}
        />
      ) : items.length ? (
        [...new Map(items.map((r) => [r.requestId, r])).values()].map((r) => (
          <MenuRow
            key={r.requestId}
            icon="news-brand"
            title={`${authorName(r.submittedBy)}님의 요청`}
            description={`${formatServerTime(r.submittedAt)} · 대기 ${r.counts.pending}건`}
            onClick={() =>
              void navigate(
                withReturn(
                  r.entries.every((entry) => entry.action === "UPDATE_SPACE")
                    ? spaceInfoRequestPath(spaceId, r.requestId)
                    : proposalRequestPath(spaceId, r.requestId),
                ),
              )
            }
          />
        ))
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
}
