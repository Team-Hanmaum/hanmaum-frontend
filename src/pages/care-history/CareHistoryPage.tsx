import { useNavigate, useOutletContext, useParams } from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { Badge, Button, MenuRow } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { formatRecordDate } from "@/features/record/model/recordDates";
import { describeCareFields } from "@/features/careitem/model/careItemFields";
import { ProposalSummaryCard } from "@/features/proposal/ui/ProposalSummaryCard";
import { ProposalSources } from "@/features/proposal/ui/ProposalSources";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  careItemPath,
  careHistoryPath,
  careSourcesPath,
  newsDetailPath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { CareChangeSummary } from "@/features/careitem/ui/CareChangeSummary";
import { careChangeTitle } from "@/features/careitem/model/careChangeRules";

export function CareHistoryPage() {
  const space = useOutletContext<CareSpaceView>();
  const { itemId = "", historyId } = useParams();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const item = data.items.find((entry) => entry.id === itemId);
  const results = data.results.filter(
    (result) =>
      result.decision === "applied" &&
      result.proposals.some((proposal) => proposal.targetId === itemId),
  );
  const deletions = (data.deletions ?? []).filter((entry) =>
    entry.itemIds.includes(itemId),
  );
  const reconfirmations = (data.reconfirmations ?? []).filter(
    (entry) => entry.itemId === itemId,
  );
  const timeline = [
    ...(data.careChanges ?? [])
      .filter(
        (change) =>
          change.status === "applied" && change.draft.itemId === itemId,
      )
      .map((change) => ({
        id: change.id,
        createdAt: change.decidedAt ?? change.createdAt,
        title: change.redacted
          ? "원본이 삭제된 변경"
          : careChangeTitle(change.draft),
        actor: change.decidedBy?.name ?? change.author.name,
      })),
    ...results.map((result) => ({
      id: result.id,
      createdAt: result.createdAt,
      title: result.proposals.some((proposal) => proposal.sourceDeleted)
        ? "이전에 변경이 반영됐어요"
        : result.proposals.every((proposal) => proposal.operation === "link")
          ? "근거 연결"
          : "내용 변경",
      actor: result.actor.name,
    })),
    ...deletions.map((entry) => ({
      id: entry.id,
      createdAt: entry.createdAt,
      title: "원본이 삭제됐어요",
      actor: entry.actor.name,
    })),
    ...reconfirmations.map((entry) => ({
      id: entry.id,
      createdAt: entry.createdAt,
      title: "새 내용으로 재확인",
      actor: entry.actor,
    })),
  ].toSorted((a, b) => b.createdAt - a.createdAt);
  const result = results.find((entry) => entry.id === historyId);
  const change = data.careChanges?.find(
    (entry) =>
      entry.id === historyId &&
      entry.status === "applied" &&
      entry.draft.itemId === itemId,
  );
  const deletion = deletions.find((entry) => entry.id === historyId);
  const reconfirmation = reconfirmations.find(
    (entry) => entry.id === historyId,
  );
  const navigate = useNavigate();
  const onBack = useBackNavigation(
    historyId
      ? careHistoryPath(space.id, itemId)
      : careItemPath(space.id, itemId),
  );
  const redactionNotice = (
    <Notice
      title="삭제된 내용은 표시하지 않아요"
      body="삭제된 근거에서 가져온 제목과 변경 전후 내용도 숨겨져요."
    />
  );
  return (
    <ProposalPageLayout
      title={historyId ? "변경 이력 상세" : "변경 이력"}
      spaceId={space.id}
      onBack={onBack}
      actions={
        <Button onClick={() => void navigate(careItemPath(space.id, itemId))}>
          항목으로 돌아가기
        </Button>
      }
    >
      <h1 className="text-hm-title-page">
        {item?.needsReconfirmation ? "변경 기록" : (item?.title ?? "변경 이력")}
      </h1>
      {historyId ? (
        change ? (
          <>
            <Badge
              label="반영된 변경"
              tone="brand"
            />
            <p className="text-hm-body-small">
              {change.decidedBy?.name ?? change.author.name} ·{" "}
              {formatRecordDate(change.decidedAt ?? change.createdAt)}
            </p>
            {change.redacted ? (
              redactionNotice
            ) : (
              <CareChangeSummary
                draft={change.draft}
                before={change.before}
                space={space}
              />
            )}
          </>
        ) : result ? (
          <>
            <Badge
              className="self-start"
              label="반영된 변경"
              tone="brand"
            />
            <p className="text-hm-body-small">
              {result.actor.name} · {formatRecordDate(result.createdAt)}
            </p>
            {result.proposals
              .filter((proposal) => proposal.targetId === itemId)
              .map((proposal) => (
                <ProposalSummaryCard
                  members={space.members}
                  key={proposal.id}
                  proposal={proposal}
                  label={
                    proposal.operation === "link" ? "근거 연결" : "확정된 변경"
                  }
                  beforeLabel="변경 전"
                  afterLabel="변경 후"
                  meta={proposal.context}
                />
              ))}
            <ProposalSources
              proposals={result.proposals.filter(
                (proposal) =>
                  proposal.targetId === itemId && !proposal.sourceDeleted,
              )}
              records={records}
              onSource={(id) => void navigate(newsDetailPath(space.id, id))}
            />
          </>
        ) : deletion ? (
          <>
            <Badge
              className="self-start"
              label="원본 삭제"
            />
            <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
              <h2 className="text-hm-heading-section">원본이 삭제됐어요</h2>
              <p className="text-hm-body-default">
                {deletion.actor.name} · {formatRecordDate(deletion.createdAt)}
              </p>
            </section>
            {redactionNotice}
          </>
        ) : reconfirmation && item ? (
          <>
            <Badge
              className="self-start"
              label="재확인 완료"
              tone="brand"
            />
            <p className="text-hm-body-small">
              {reconfirmation.actor} ·{" "}
              {formatRecordDate(reconfirmation.createdAt)}
            </p>
            <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
              <h2 className="text-hm-heading-section">
                {reconfirmation.fields.title}
              </h2>
              <p className="text-hm-body-default whitespace-pre-wrap">
                {describeCareFields(
                  item.kind,
                  reconfirmation.fields,
                  space.members,
                )}
              </p>
              <h2 className="text-hm-heading-section">새로 확인한 근거</h2>
              <p className="text-hm-body-reading whitespace-pre-wrap">
                {reconfirmation.evidence}
              </p>
            </section>
          </>
        ) : (
          <EmptyState
            title="이력을 확인할 수 없어요"
            body="현재 항목의 변경 이력을 다시 선택해 주세요."
          />
        )
      ) : (
        <>
          <p className="text-hm-body-default text-hm-text-secondary">
            최근에 반영된 변경부터 확인해요.
          </p>
          {timeline.map((entry) => (
            <MenuRow
              key={entry.id}
              icon="clock-brand"
              title={entry.title}
              description={
                entry.actor + " · " + formatRecordDate(entry.createdAt)
              }
              onClick={() =>
                void navigate(careHistoryPath(space.id, itemId, entry.id))
              }
            />
          ))}
          {!timeline.length && (
            <EmptyState
              title="아직 반영된 변경이 없어요"
              body="제안·요청은 확정된 변경 이력과 구분해요."
            />
          )}
          {deletions.length > 0 && redactionNotice}
          {item && (
            <MenuRow
              icon="link-brand"
              title="항목의 근거 보기"
              onClick={() => void navigate(careSourcesPath(space.id, item.id))}
            />
          )}
        </>
      )}
    </ProposalPageLayout>
  );
}
