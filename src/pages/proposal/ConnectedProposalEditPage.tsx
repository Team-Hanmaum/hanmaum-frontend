import { useState } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { useProposal } from "@/features/proposal/model/useProposalQueries";
import { useProposalDrafts } from "@/features/proposal/model/useProposalDrafts";
import {
  initialProposalDraft,
  proposalDraftProblem,
  type ProposalDraft,
} from "@/features/proposal/model/proposalDraft";
import type { ProposalDetail } from "@/features/proposal/api/proposalReadTypes";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { CareTimeSelection } from "@/features/careitem/ui/CareTimeSelection";
import { ProposalValuesForm } from "@/features/proposal/ui/ProposalValuesForm";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useTimeSelectionScreen } from "@/routes/useTimeSelectionScreen";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { proposalListPath } from "@/routes/paths";
export function ConnectedProposalEditPage() {
  const { space } = useConnectedSpace();
  const { proposalId = "" } = useParams();
  const query = useProposal(space.spaceId, proposalId);
  const { withReturn } = useWithdrawalReturn();
  const back = useBackNavigation(withReturn(proposalListPath(space.spaceId)));
  return !query.data ? (
    <ProposalPageLayout
      title="제안 내용 수정"
      spaceId={space.spaceId}
      onBack={back}
    >
      <ReviewQueryState
        error={query.error}
        retry={() => void query.refetch()}
      />
    </ProposalPageLayout>
  ) : query.data.status !== "REVIEW_PENDING" ||
    query.data.action === "LINK_EVIDENCE" ? (
    <ProposalPageLayout
      title="제안 내용 수정"
      spaceId={space.spaceId}
      onBack={back}
    >
      <EmptyState
        title="수정할 수 없는 제안이에요"
        body="이미 처리되었거나 근거만 연결하는 제안이에요."
      />
    </ProposalPageLayout>
  ) : (
    <Editor
      key={proposalId}
      spaceId={space.spaceId}
      proposal={query.data}
      onBack={back}
      refreshFailed={query.isError}
      onRetry={() => void query.refetch()}
    />
  );
}
function Editor({
  spaceId,
  proposal,
  onBack,
  refreshFailed,
  onRetry,
}: {
  spaceId: string;
  proposal: ProposalDetail;
  onBack: () => void;
  refreshFailed: boolean;
  onRetry: () => void;
}) {
  const { drafts, save } = useProposalDrafts(spaceId);
  const [initial] = useState(() =>
    drafts[proposal.proposalId]?.reviewToken === proposal.reviewToken
      ? drafts[proposal.proposalId]
      : initialProposalDraft(proposal),
  );
  const [draft, setDraft] = useState<ProposalDraft>(initial);
  const [error, setError] = useState("");
  const members = useSpaceMembers(spaceId);
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft);
  const guard = useUnsavedChanges(dirty);
  const time = useTimeSelectionScreen(proposal.itemType === "SCHEDULE");
  const change = (key: string, value: string | null) =>
    setDraft((old) => ({ ...old, values: { ...old.values, [key]: value } }));
  const expired =
    draft.reviewToken !== proposal.reviewToken ||
    proposal.status !== "REVIEW_PENDING";
  function confirm() {
    if (refreshFailed) return;
    const problem = proposalDraftProblem(proposal, draft);
    if (problem) {
      setError(problem);
      return;
    }
    save(proposal.proposalId, draft);
    guard.allowNavigation(onBack);
  }
  const dialog = (
    <UnsavedChangesDialog
      open={guard.blocker.state === "blocked"}
      onStay={() => guard.blocker.reset?.()}
      onLeave={() => guard.blocker.proceed?.()}
    />
  );
  const refreshNotice = refreshFailed && (
    <Notice
      tone="error"
      title="최신 제안을 확인하지 못했어요"
      body="수정 중인 내용은 유지하고 있어요. 다시 불러온 뒤 수정 내용을 확인해 주세요."
      action={{ label: "다시 불러오기", onClick: onRetry }}
    />
  );
  if (time.open)
    return (
      <>
        {dialog}
        <CareTimeSelection
          initialValue={
            typeof draft.values.scheduledTime === "string"
              ? draft.values.scheduledTime
              : ""
          }
          onBack={time.close}
          onConfirm={(value) => {
            change("scheduledTime", value);
            time.close();
          }}
          renderLayout={({ content, actions }) => (
            <ProposalPageLayout
              title="시간 선택"
              spaceId={spaceId}
              onBack={time.close}
              actions={actions}
            >
              {refreshNotice}
              {content}
            </ProposalPageLayout>
          )}
        />
      </>
    );
  return (
    <ProposalPageLayout
      title="제안 내용 수정"
      spaceId={spaceId}
      onBack={onBack}
      actions={
        <Button
          disabled={expired || refreshFailed}
          onClick={confirm}
        >
          수정 내용 확인
        </Button>
      }
    >
      {dialog}
      {refreshNotice}
      <h1 className="text-hm-title-page">반영할 내용을 다듬어 주세요</h1>
      <Notice
        title="현재 돌봄 정보는 그대로예요"
        body="여기서는 검토할 초안만 바꿔요. 최종 확인 후 반영하거나 소유자에게 요청해요."
      />
      {expired ? (
        <Notice
          tone="error"
          title="제안이 바뀌었어요"
          body="수정 내용을 저장하지 않고 목록에서 최신 제안을 다시 확인해 주세요."
        />
      ) : (
        <ProposalValuesForm
          proposal={proposal}
          draft={draft}
          onChange={change}
          onTime={time.show}
          members={members.data ?? []}
        />
      )}
      {members.isError && (
        <Notice
          tone="error"
          title="담당자 목록을 불러오지 못했어요"
          body="담당자를 변경하려면 목록을 다시 불러와 주세요."
          action={{
            label: "다시 불러오기",
            onClick: () => void members.refetch(),
          }}
        />
      )}
      {error && (
        <Notice
          tone="error"
          title="내용을 확인해 주세요"
          body={error}
        />
      )}
    </ProposalPageLayout>
  );
}
