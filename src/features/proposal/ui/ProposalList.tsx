import {
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
} from "@/components/feedback";
import { Tabs } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { RecordView } from "@/features/record/model/recordViewTypes";
import { formatRecordDate } from "@/features/record/model/recordDates";
import {
  proposalStatusLabel,
  proposalTabs,
  type ProposalSpaceState,
  type ProposalStatus,
} from "../model/proposalViewTypes";
import { ProposalSummaryCard } from "./ProposalSummaryCard";

export function ProposalList({
  space,
  data,
  records,
  status,
  state,
  onStatus,
  onReview,
  onRequest,
  onResult,
  onSource,
  onNews,
  onRetry,
}: {
  space: CareSpaceView;
  data: ProposalSpaceState;
  records: readonly RecordView[];
  status: ProposalStatus;
  state: string;
  onStatus: (status: string) => void;
  onReview: (recordId: string) => void;
  onRequest: (requestId: string) => void;
  onResult: (resultId: string) => void;
  onSource: (recordId: string) => void;
  onNews: () => void;
  onRetry: () => void;
}) {
  const owner = space.members.find((member) => member.role === "owner");
  const date = formatRecordDate;
  function panel(tab: ProposalStatus) {
    if (state === "loading")
      return <LoadingState label="확인할 내용을 불러오고 있어요" />;
    if (state === "error")
      return (
        <ErrorState
          reason="load-error"
          onAction={onRetry}
        />
      );
    const pending = data.proposals.filter(
      (item) => item.status === "review" && !item.sourceDeleted,
    );
    const recordIds = [...new Set(pending.map((item) => item.recordId))];
    const requests = data.requests.filter(
      (request) =>
        (space.role === "owner" ||
          request.author.id ===
            space.members.find((member) => member.self)?.id) &&
        data.proposals.some(
          (item) =>
            item.requestId === request.id &&
            item.status === "requested" &&
            !item.sourceDeleted,
        ),
    );
    const results = data.results.filter((item) => item.decision === tab);
    const count =
      tab === "review"
        ? pending.length
        : tab === "requested"
          ? requests.length
          : results.length;
    if (!count || state === "empty")
      return (
        <EmptyState
          title={
            tab === "review"
              ? "검토할 내용이 없어요"
              : `${proposalStatusLabel(tab)} 내역이 없어요`
          }
          body="현재 범위에 해당하는 내용이 없어요. 다른 상태도 확인해 보세요."
          action={{ label: "소식 목록으로", onClick: onNews }}
        />
      );
    return (
      <div className="flex flex-col gap-hm-24">
        {tab === "review" && (
          <>
            <h2 className="text-hm-heading-section">
              검토 대기 {pending.length}건
            </h2>
            {recordIds.map((id) => {
              const proposals = pending.filter((item) => item.recordId === id);
              const record = records.find((item) => item.id === id);
              return (
                <ProposalSummaryCard
                  members={space.members}
                  key={id}
                  proposal={proposals[0]}
                  label={`검토 대기 · AI 제안${proposals.length > 1 ? ` ${proposals.length}건` : ""}`}
                  meta={
                    record
                      ? `${record.author.name}의 소식 · ${date(record.createdAt)}`
                      : "원본 확인 필요"
                  }
                  action={{
                    label: "제안 검토하기",
                    onClick: () => onReview(id),
                  }}
                />
              );
            })}
            <Notice
              tone="neutral"
              title="현재 돌봄 정보는 유지돼요"
              body="검토 전에는 제안이 실제 돌봄 정보에 반영되지 않아요."
            />
          </>
        )}
        {tab === "requested" && (
          <>
            {space.role === "owner" && (
              <p className="text-hm-body-default text-hm-text-secondary">
                요청 내용과 근거를 확인한 뒤 반영해요.
              </p>
            )}
            {requests.map((request) => {
              const remaining = request.proposals.filter((proposal) =>
                data.proposals.some(
                  (item) =>
                    item.id === proposal.id &&
                    item.status === "requested" &&
                    !item.sourceDeleted,
                ),
              );
              return (
                <ProposalSummaryCard
                  members={space.members}
                  key={request.id}
                  proposal={remaining[0]}
                  label="승인 요청"
                  afterLabel="요청한 내용"
                  meta={`${request.author.name} · ${date(request.createdAt)}\n${space.role === "member" ? `소유자 ${owner?.name ?? "가족"}님의 확인을 기다리고 있어요.` : `AI 제안 반영 요청 ${remaining.length}건`}`}
                  action={{
                    label:
                      space.role === "owner"
                        ? "요청 검토하기"
                        : "요청 상태 보기",
                    onClick: () => onRequest(request.id),
                  }}
                />
              );
            })}
          </>
        )}
        {(tab === "applied" || tab === "rejected") && (
          <>
            <p className="text-hm-body-default text-hm-text-secondary">
              {tab === "applied"
                ? "이미 반영된 제안과 요청이에요."
                : "소유자가 미적용 처리한 내용이에요. 현재 돌봄 정보는 바뀌지 않았어요."}
            </p>
            {results.map((result) => (
              <ProposalSummaryCard
                members={space.members}
                key={result.id}
                proposal={result.proposals[0]}
                label={proposalStatusLabel(tab)}
                afterLabel={
                  tab === "applied" ? "반영한 내용" : "반영하지 않은 제안"
                }
                meta={`${result.actor.name} · ${date(result.createdAt)}\n${result.proposals.length}건 ${proposalStatusLabel(tab)}`}
                action={{
                  label:
                    tab === "applied" ? "반영 결과 보기" : "근거 소식 보기",
                  onClick: () =>
                    tab === "applied"
                      ? onResult(result.id)
                      : onSource(result.proposals[0].recordId),
                }}
              />
            ))}
          </>
        )}
      </div>
    );
  }
  return (
    <>
      <h1 className="sr-only">확인할 내용</h1>
      <p className="text-hm-body-small text-hm-text-secondary">
        {space.subjectLabel}의 돌봄 ·{" "}
        {status === "requested"
          ? `${space.role === "owner" ? "소유자" : "구성원"} ${space.members.find((member) => member.self)?.name ?? "나"}`
          : "공간 전체"}
      </p>
      <Tabs
        className="[&_[role=tab]]:px-hm-4 [&_[role=tablist]]:gap-hm-4"
        label="확인할 내용 상태"
        value={status}
        onValueChange={onStatus}
        items={proposalTabs.map((tab) => ({
          ...tab,
          content: panel(tab.value),
        }))}
      />
    </>
  );
}
