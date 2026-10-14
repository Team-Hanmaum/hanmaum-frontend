import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { BottomSheet, EmptyState } from "@/components/feedback";
import { Badge, Button, MenuRow, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { formatRecordDate } from "@/features/record/model/recordDates";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { ProposalSummaryCard } from "@/features/proposal/ui/ProposalSummaryCard";
import { ProposalSources } from "@/features/proposal/ui/ProposalSources";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  careHistoryPath,
  careItemPath,
  newsDetailPath,
  proposalListPath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function ProposalResultPage() {
  const space = useOutletContext<CareSpaceView>();
  const { resultId } = useParams();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const result = data.results.find((item) => item.id === resultId);
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<"items" | "history" | "decision" | null>(
    null,
  );
  const applied = result?.decision === "applied";
  const items = data.items.filter((item) =>
    result?.proposals.some((proposal) => proposal.targetId === item.id),
  );
  const onBack = useBackNavigation(
    proposalListPath(space.id, applied ? "applied" : "rejected"),
  );
  function open(kind: "items" | "history") {
    if (items.length === 1)
      void navigate(
        kind === "items"
          ? careItemPath(space.id, items[0].id)
          : careHistoryPath(space.id, items[0].id, result?.id),
      );
    else setSheet(kind);
  }
  return (
    <ProposalPageLayout
      title={applied ? "반영 완료" : "미적용 결과"}
      spaceId={space.id}
      onBack={onBack}
      tabs
      actions={
        result && (
          <>
            {items.length > 0 && (
              <Button onClick={() => open("items")}>현재 돌봄 정보 보기</Button>
            )}
            <TextAction
              onClick={() =>
                void navigate(proposalListPath(space.id, result.decision))
              }
            >
              확인할 내용 목록으로
            </TextAction>
          </>
        )
      }
    >
      {!result ? (
        <EmptyState
          title="처리 결과를 확인할 수 없어요"
          body="새로고침하면 Mock 처리 결과는 초기화돼요. 목록에서 다시 확인해 주세요."
          action={{
            label: "확인할 내용 목록으로",
            onClick: () => void navigate(proposalListPath(space.id)),
          }}
        />
      ) : (
        <>
          <Badge
            label={applied ? "반영 완료" : "미적용"}
            tone={applied ? "brand" : "neutral"}
          />
          <h1 className="text-hm-title-page">
            {!applied
              ? "미적용 처리했어요"
              : result.proposals.every(
                    (proposal) => proposal.operation === "link",
                  )
                ? "근거를 연결했어요"
                : result.proposals.length === 1 &&
                    result.proposals[0].kind === "schedule"
                  ? "일정을 변경했어요"
                  : "선택한 내용을 반영했어요"}
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {applied
              ? "가족도 같은 정보로 확인할 수 있어요."
              : "현재 돌봄 정보는 바뀌지 않았어요."}
          </p>
          {result.proposals.map((proposal) => (
            <ProposalSummaryCard
              key={proposal.id}
              proposal={proposal}
              label={applied ? "반영된 내용" : "반영하지 않은 제안"}
              meta={proposal.context}
              afterLabel={applied ? "반영 후" : "미적용 제안"}
            />
          ))}
          <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
            <h2 className="text-hm-heading-section">
              이번 {applied ? "변경 이력" : "처리 내역"}
            </h2>
            <p className="text-hm-body-emphasis">
              {result.actor.name} · 소유자
            </p>
            <p className="text-hm-body-small text-hm-text-secondary">
              {formatRecordDate(result.createdAt)} {applied ? "반영" : "미적용"}
            </p>
            <Button
              variant="secondary"
              onClick={() => (applied ? open("history") : setSheet("decision"))}
            >
              {applied ? "변경 이력 보기" : "처리 내역 보기"}
            </Button>
          </section>
          <ProposalSources
            proposals={result.proposals}
            records={records}
            onSource={(id) => void navigate(newsDetailPath(space.id, id))}
          />
          <BottomSheet
            open={sheet !== null}
            onOpenChange={(isOpen) => {
              if (!isOpen) setSheet(null);
            }}
            title={
              sheet === "decision" ? "미적용 처리 내역" : "확인할 항목 선택"
            }
          >
            {sheet === "decision" ? (
              <>
                <p className="text-hm-body-default">
                  {result.actor.name} · {formatRecordDate(result.createdAt)}
                </p>
                {result.proposals.map((proposal) => (
                  <ProposalSummaryCard
                    key={proposal.id}
                    proposal={proposal}
                    label="미적용"
                    afterLabel="반영하지 않은 제안"
                  />
                ))}
              </>
            ) : (
              items.map((item) => (
                <MenuRow
                  key={item.id}
                  icon={sheet === "history" ? "clock" : "care"}
                  title={
                    item.needsReconfirmation
                      ? "재확인이 필요한 항목"
                      : item.title
                  }
                  onClick={() => {
                    setSheet(null);
                    void navigate(
                      sheet === "history"
                        ? careHistoryPath(space.id, item.id, result.id)
                        : careItemPath(space.id, item.id),
                    );
                  }}
                />
              ))
            )}
          </BottomSheet>
        </>
      )}
    </ProposalPageLayout>
  );
}
