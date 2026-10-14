import { useLocation, useNavigate, useOutletContext } from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { Badge, Button, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { readProposalConfirmation } from "@/features/proposal/model/proposalConfirmation";
import { useProposalAction } from "@/features/proposal/model/useProposalAction";
import { proposalConfirmStates } from "@/features/proposal/model/proposalScreenStates";
import { ProposalSummaryCard } from "@/features/proposal/ui/ProposalSummaryCard";
import { ProposalSources } from "@/features/proposal/ui/ProposalSources";
import { ProposalFailureView } from "@/features/proposal/ui/ProposalFailureView";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  newsDetailPath,
  proposalListPath,
  proposalRequestPath,
  proposalResultPath,
  proposalReviewPath,
} from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";

export function ProposalConfirmPage() {
  const space = useOutletContext<CareSpaceView>();
  const { state: historyState } = useLocation();
  const draft = readProposalConfirmation(historyState);
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const navigate = useNavigate();
  const [state, setState] = useMockScreenState(
    proposalConfirmStates,
    "default",
  );
  const { pending, failure, submit } = useProposalAction(space);
  const request = data.requests.find((item) => item.id === draft?.requestId);
  const proposals = data.proposals.filter(
    (item) =>
      !item.sourceDeleted &&
      draft?.selection.some((selected) => selected.id === item.id) &&
      (draft.requestId
        ? item.requestId === draft.requestId && item.status === "requested"
        : item.recordId === draft.recordId && item.status === "review"),
  );
  const valid =
    space.role === "owner" &&
    draft &&
    proposals.length === draft.selection.length;
  const reviewPath = draft?.recordId
    ? proposalReviewPath(space.id, draft.recordId)
    : draft?.requestId
      ? proposalRequestPath(space.id, draft.requestId)
      : proposalListPath(space.id);
  const onReview = () => void navigate(reviewPath, { replace: true });
  function decide(decision: "applied" | "rejected") {
    if (!valid) return;
    submit(
      draft.selection,
      decision,
      (id) =>
        void navigate(
          decision === "applied"
            ? proposalResultPath(space.id, id)
            : proposalListPath(space.id, "rejected"),
          { replace: true },
        ),
      state === "changed" ? "changed" : undefined,
    );
  }
  const blocked = failure && failure !== "request-error";
  return (
    <ProposalPageLayout
      title={blocked ? "반영 결과 확인" : "반영 전 확인"}
      spaceId={space.id}
      onBack={onReview}
      preview={{
        value: state,
        options: proposalConfirmStates,
        onChange: setState,
      }}
      actions={
        blocked ? (
          <Button onClick={onReview}>선택 다시 하기</Button>
        ) : (
          valid && (
            <>
              <Button
                loading={pending}
                onClick={() => decide("applied")}
              >
                선택한 {proposals.length}건 반영하기
              </Button>
              <TextAction
                tone="danger"
                disabled={pending}
                onClick={() => decide("rejected")}
              >
                선택한 {proposals.length}건 미적용 처리
              </TextAction>
            </>
          )
        )
      }
    >
      {!valid ? (
        <EmptyState
          title="반영할 내용을 다시 선택해 주세요"
          body="선택 정보가 없거나 이미 처리됐어요. 소유자만 최종 반영할 수 있어요."
          action={{
            label: "확인할 내용 목록으로",
            onClick: () => void navigate(proposalListPath(space.id)),
          }}
        />
      ) : blocked ? (
        <ProposalFailureView
          failure={failure}
          proposals={proposals}
          data={data}
          onReview={onReview}
        />
      ) : (
        <>
          <Badge
            label="소유자 확인"
            tone="brand"
          />
          <h1 className="text-hm-title-page whitespace-pre-line">
            {"이 내용으로\n반영할까요?"}
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {request ? `${request.author.name}님이 요청한` : "선택한"} 변경{" "}
            {proposals.length}건이에요.
          </p>
          {proposals.map((proposal) => (
            <ProposalSummaryCard
              key={proposal.id}
              proposal={{
                ...proposal,
                beforeValue:
                  data.items.find((item) => item.id === proposal.targetId)
                    ?.value ?? proposal.beforeValue,
              }}
              label={proposal.typeLabel}
              afterLabel="반영할 내용"
              meta={proposal.context}
            />
          ))}
          <ProposalSources
            proposals={proposals}
            records={records}
            onSource={(id) => void navigate(newsDetailPath(space.id, id))}
          />
          <Notice
            title="반영하면 가족에게도 보여요"
            body="현재 돌봄 정보가 바뀌고, 누가 언제 반영했는지 이력에 남아요."
          />
          <p className="text-hm-body-small text-hm-text-secondary">
            검토한 뒤 내용이 달라졌다면 반영 전에 다시 확인하도록 안내해요.
          </p>
        </>
      )}
    </ProposalPageLayout>
  );
}
