import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { Badge, Button, MenuRow, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { CareEvidenceList } from "@/features/careitem/ui/CareEvidenceList";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { ProposalSources } from "@/features/proposal/ui/ProposalSources";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  careItemPath,
  newsDetailPath,
  proposalListPath,
  proposalRequestPath,
  proposalReviewPath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function ProposalEvidencePage() {
  const space = useOutletContext<CareSpaceView>();
  const { proposalId } = useParams();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const proposal = data.proposals.find(
    (entry) => entry.id === proposalId && !entry.sourceDeleted,
  );
  const item = data.items.find(
    (entry) => entry.id === proposal?.targetId && !entry.needsReconfirmation,
  );
  const navigate = useNavigate();
  const { withReturn } = useWithdrawalReturn();
  const reviewPath = proposal?.requestId
    ? withReturn(proposalRequestPath(space.id, proposal.requestId))
    : proposal
      ? withReturn(proposalReviewPath(space.id, proposal.recordId))
      : withReturn(proposalListPath(space.id));
  const onBack = useBackNavigation(reviewPath);
  const onSource = (id: string) =>
    void navigate(withReturn(newsDetailPath(space.id, id)));
  const link = proposal?.operation === "link";
  const differentDate =
    proposal?.kind === "schedule" &&
    item?.fields.date !== proposal?.afterFields?.date;
  return (
    <ProposalPageLayout
      title="근거 비교"
      spaceId={space.id}
      onBack={onBack}
      actions={
        proposal &&
        item && (
          <>
            <Button onClick={onBack}>제안 검토로 돌아가기</Button>
            <TextAction
              onClick={() =>
                void navigate(withReturn(proposalListPath(space.id)))
              }
            >
              나중에 확인하기
            </TextAction>
          </>
        )
      }
    >
      {!proposal || !item ? (
        <EmptyState
          title="비교할 근거를 확인할 수 없어요"
          body="원본이나 연결된 항목이 삭제·변경됐을 수 있어요. 삭제된 내용은 표시하지 않아요."
          action={{
            label: "확인할 내용으로",
            onClick: () =>
              void navigate(withReturn(proposalListPath(space.id))),
          }}
        />
      ) : (
        <>
          <Badge
            className="self-start"
            label={link ? "근거 연결" : "내용 비교"}
          />
          <h1 className="text-hm-title-page">
            {link
              ? "같은 내용의 근거를 확인해 주세요"
              : differentDate
                ? "날짜가 다르게 기록돼 있어요"
                : "현재 내용과 제안의 근거를 비교해 주세요"}
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            두 근거를 확인한 뒤 제안을 검토해 주세요.
          </p>
          <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
            <h2 className="text-hm-heading-section">현재 정보</h2>
            <p className="text-hm-body-default">
              {item.title}
              <br />
              {item.value} · {item.meta}
            </p>
          </section>
          <CareEvidenceList
            item={item}
            records={records}
            onSource={onSource}
          />
          <ProposalSources
            proposals={[proposal]}
            records={records}
            onSource={onSource}
          />
          <MenuRow
            icon="link-brand"
            title="현재 항목의 상세·이력"
            onClick={() =>
              void navigate(withReturn(careItemPath(space.id, item.id)))
            }
          />
          <Notice
            title="현재 정보는 그대로예요"
            body="이 화면을 읽는 것만으로 제안이 반영되지는 않아요."
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
