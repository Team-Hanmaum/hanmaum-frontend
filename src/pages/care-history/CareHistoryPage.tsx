import { useNavigate, useOutletContext, useParams } from "react-router";
import { EmptyState } from "@/components/feedback";
import { Badge, Button, MenuRow } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { formatRecordDate } from "@/features/record/model/recordDates";
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

export function CareHistoryPage() {
  const space = useOutletContext<CareSpaceView>();
  const { itemId = "", historyId } = useParams();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const item = data.items.find((entry) => entry.id === itemId);
  const history = data.results
    .filter(
      (result) =>
        result.decision === "applied" &&
        result.proposals.some((proposal) => proposal.targetId === itemId),
    )
    .toSorted((a, b) => b.createdAt - a.createdAt);
  const result = history.find((entry) => entry.id === historyId);
  const navigate = useNavigate();
  const onBack = useBackNavigation(
    historyId
      ? careHistoryPath(space.id, itemId)
      : careItemPath(space.id, itemId),
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
        result ? (
          <>
            <Badge
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
                  key={proposal.id}
                  proposal={proposal}
                  label={
                    proposal.operation === "link" ? "근거 연결" : "확정된 변경"
                  }
                  afterLabel="변경 후"
                  meta={proposal.context}
                />
              ))}
            <ProposalSources
              proposals={result.proposals.filter(
                (proposal) => proposal.targetId === itemId,
              )}
              records={records}
              onSource={(id) => void navigate(newsDetailPath(space.id, id))}
            />
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
          {history.map((entry) => (
            <MenuRow
              key={entry.id}
              icon="clock"
              title={
                entry.proposals.find((proposal) => proposal.targetId === itemId)
                  ?.operation === "link"
                  ? "근거 연결"
                  : "내용 변경"
              }
              description={`${entry.actor.name} · ${formatRecordDate(entry.createdAt)}`}
              onClick={() =>
                void navigate(careHistoryPath(space.id, itemId, entry.id))
              }
            />
          ))}
          {!history.length && (
            <EmptyState
              title="아직 반영된 변경이 없어요"
              body="제안·요청은 확정된 변경 이력과 구분해요."
            />
          )}
          {item && (
            <MenuRow
              icon="link"
              title="항목의 근거 보기"
              onClick={() => void navigate(careSourcesPath(space.id, item.id))}
            />
          )}
        </>
      )}
    </ProposalPageLayout>
  );
}
