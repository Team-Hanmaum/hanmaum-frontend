import { useSearchParams } from "react-router";
import { Button, MenuRow, Tabs } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { useProposalList } from "@/features/proposal/model/useProposalQueries";
import { useChangeRequests } from "@/features/proposal/model/useChangeRequests";
import {
  actionLabels,
  proposalStatusLabels,
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
import { useConnectedSpace } from "@/routes/useConnectedSpace";
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
const tabs = [
  { value: "review", label: "검토 필요" },
  { value: "requests", label: "가족 요청" },
  { value: "applied", label: "반영됨" },
  { value: "rejected", label: "미반영" },
  { value: "invalidated", label: "무효" },
];
const statuses: Record<string, ProposalStatus> = {
  review: "REVIEW_PENDING",
  applied: "APPLIED",
  rejected: "DECLINED",
  invalidated: "INVALIDATED",
};
export function ConnectedProposalListPage() {
  const { space } = useConnectedSpace();
  const [params, setParams] = useSearchParams();
  const status = tabs.some((t) => t.value === params.get("status"))
    ? params.get("status")!
    : "review";
  const { withReturn } = useWithdrawalReturn();
  const navigate = useAppNavigate();
  const back = useBackNavigation(withReturn(spacePath(space.spaceId, "news")));
  return (
    <ProposalPageLayout
      title="확인할 내용"
      spaceId={space.spaceId}
      onBack={back}
      tabs
    >
      <h1 className="text-hm-title-page">제안과 가족의 요청</h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        {space.role === "OWNER"
          ? "내용을 검토하고 선택한 내용만 반영해요."
          : "가족에게 반영을 요청할 수 있어요. 최종 반영은 소유자가 진행해요."}
      </p>
      <MenuRow
        icon="edit"
        title="공간 정보 수정 요청"
        description="공간 이름 수정 요청과 처리 결과"
        onClick={() =>
          void navigate(withReturn(spaceInfoRequestsPath(space.spaceId)))
        }
      />
      <Tabs
        label="제안 상태"
        value={status}
        onValueChange={(value) => {
          const next = new URLSearchParams(params);
          next.set("status", value);
          void setParams(next);
        }}
        items={tabs.map((tab) => ({
          ...tab,
          content:
            tab.value !== status ? null : status === "requests" ? (
              <RequestList spaceId={space.spaceId} />
            ) : (
              <ProposalList
                spaceId={space.spaceId}
                status={statuses[status]}
              />
            ),
        }))}
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
        items.map((p) => (
          <MenuRow
            key={p.proposalId}
            icon="news-brand"
            title={p.title ?? "내용이 제거된 제안"}
            badge={proposalStatusLabels[p.status]}
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
        ))
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
