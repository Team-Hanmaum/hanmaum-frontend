import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { BottomSheet, EmptyState, Notice } from "@/components/feedback";
import { Badge, Button, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { formatRecordDate } from "@/features/record/model/recordDates";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { ProposalSummaryCard } from "@/features/proposal/ui/ProposalSummaryCard";
import { ProposalSources } from "@/features/proposal/ui/ProposalSources";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { newsDetailPath, proposalListPath, spacePath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function ProposalResultPage() {
  const space = useOutletContext<CareSpaceView>();
  const { resultId } = useParams();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const result = data.results.find((item) => item.id === resultId);
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<"items" | "history" | null>(null);
  const applied = result?.decision === "applied";
  const onBack = useBackNavigation(
    proposalListPath(space.id, applied ? "applied" : "rejected"),
  );
  return (
    <ProposalPageLayout
      title={applied ? "반영 완료" : "미적용 결과"}
      spaceId={space.id}
      onBack={onBack}
      tabs
      actions={
        result && (
          <>
            <Button onClick={() => setSheet("items")}>
              현재 돌봄 정보 보기
            </Button>
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
            {applied
              ? result.proposals.length === 1 &&
                result.proposals[0].kind === "schedule"
                ? "일정을 변경했어요"
                : "선택한 내용을 반영했어요"
              : "미적용 처리했어요"}
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {applied
              ? "가족도 같은 정보로 확인할 수 있어요."
              : "현재 돌봄 정보는 바뀌지 않았어요."}
          </p>
          {result.proposals.map((proposal) => (
            <article
              key={proposal.id}
              className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20 wrap-anywhere"
            >
              <h2 className="text-hm-title-hero">{proposal.title}</h2>
              <p className="text-hm-body-emphasis">
                {applied ? proposal.afterValue : proposal.beforeValue}
              </p>
              <p className="text-hm-body-small whitespace-pre-wrap text-hm-text-secondary">
                {proposal.context}
              </p>
              <p className="text-hm-body-small text-hm-text-secondary">
                {applied
                  ? `${proposal.beforeValue}에서 변경됐어요.`
                  : "제안한 내용은 반영하지 않았어요."}
              </p>
            </article>
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
            <p className="text-hm-body-default">
              소식의 근거를 확인한 뒤 선택한 {result.proposals.length}건을{" "}
              {applied ? "반영" : "미적용 처리"}했어요.
            </p>
            <Button
              variant="secondary"
              onClick={() => setSheet("history")}
            >
              {applied ? "변경 이력 보기" : "처리 내역 보기"}
            </Button>
          </section>
          <BottomSheet
            open={sheet !== null}
            onOpenChange={(open) => {
              if (!open) setSheet(null);
            }}
            title={
              sheet === "history"
                ? "이번 처리 내역 · Mock"
                : "현재 돌봄 정보 · Mock"
            }
          >
            <div className="flex flex-col gap-hm-24">
              <Notice
                tone="neutral"
                title="제안 검토 흐름의 예시 정보예요"
                body="전체 돌봄 상세와 이력 화면은 후속 작업에서 연결해요."
              />
              {sheet === "history" ? (
                <>
                  {result.proposals.map((proposal) => (
                    <ProposalSummaryCard
                      key={proposal.id}
                      proposal={proposal}
                      label={applied ? "반영" : "미적용"}
                      afterLabel={
                        applied ? "반영한 내용" : "반영하지 않은 제안"
                      }
                    />
                  ))}
                  <ProposalSources
                    proposals={result.proposals}
                    records={records}
                    onSource={(id) => {
                      setSheet(null);
                      void navigate(newsDetailPath(space.id, id));
                    }}
                  />
                </>
              ) : (
                result.proposals.map((proposal) => {
                  const item = data.items.find(
                    (entry) => entry.id === proposal.targetId,
                  );
                  return (
                    <section
                      key={proposal.id}
                      className="flex flex-col gap-hm-12"
                    >
                      <h2 className="text-hm-heading-section">{item?.title}</h2>
                      <p className="text-hm-body-default">{item?.value}</p>
                      <p className="text-hm-body-small text-hm-text-secondary">
                        {item?.meta}
                      </p>
                    </section>
                  );
                })
              )}
              <Button
                variant="secondary"
                onClick={() => void navigate(spacePath(space.id))}
              >
                홈에서 확인하기
              </Button>
            </div>
          </BottomSheet>
        </>
      )}
    </ProposalPageLayout>
  );
}
