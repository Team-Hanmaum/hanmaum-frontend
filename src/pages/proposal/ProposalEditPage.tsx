import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { Badge, Button, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { validateCareFields } from "@/features/careitem/model/careItemFields";
import { CareFieldsForm } from "@/features/careitem/ui/CareFieldsForm";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { mockProposals } from "@/features/proposal/model/mockProposals";
import {
  proposalFields,
  isConfirmedQuestionChange,
} from "@/features/proposal/model/proposalDrafts";
import type { ProposalView } from "@/features/proposal/model/proposalViewTypes";
import { useProposalAction } from "@/features/proposal/model/useProposalAction";
import { ProposalSources } from "@/features/proposal/ui/ProposalSources";
import { ProposalSummaryCard } from "@/features/proposal/ui/ProposalSummaryCard";
import { useMockAction } from "@/lib/useMockAction";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { CareTimeSelection } from "@/features/careitem/ui/CareTimeSelection";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  newsDetailPath,
  proposalConfirmPath,
  proposalListPath,
  proposalRequestPath,
  proposalReviewPath,
} from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { useTimeSelectionScreen } from "@/routes/useTimeSelectionScreen";

const states = [
  { value: "default", label: "기본" },
  { value: "save-error", label: "수정 저장 실패" },
  { value: "source-deleted", label: "원본 근거 삭제" },
  { value: "changed", label: "제안 변경됨" },
] as const;
export function ProposalEditPage() {
  const space = useOutletContext<CareSpaceView>();
  const { proposalId } = useParams();
  const data = useMockProposals(space);
  const proposal = data.proposals.find(
    (item) =>
      item.id === proposalId &&
      item.status === "review" &&
      !item.sourceDeleted &&
      item.operation !== "link",
  );
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const locked =
    proposal &&
    isConfirmedQuestionChange(
      proposal,
      data.items.find((item) => item.id === proposal.targetId),
    );
  if (!proposal || locked)
    return (
      <ProposalPageLayout
        title="제안 내용 수정"
        spaceId={space.id}
        onBack={() => void navigate(withReturn(proposalListPath(space.id)))}
      >
        <EmptyState
          title={
            locked ? "이미 확인된 질문이에요" : "수정할 제안을 확인할 수 없어요"
          }
          body={
            locked
              ? "답변 확인이 끝난 질문은 내용을 수정할 수 없어요."
              : "원본이 삭제되었거나 이미 요청·처리된 제안은 수정할 수 없어요."
          }
          action={{
            label: "확인할 내용으로",
            onClick: () =>
              void navigate(withReturn(proposalListPath(space.id))),
          }}
        />
      </ProposalPageLayout>
    );
  return (
    <ProposalEditor
      key={proposal.id}
      space={space}
      proposal={proposal}
    />
  );
}
function ProposalEditor({
  space,
  proposal,
}: {
  space: CareSpaceView;
  proposal: ProposalView;
}) {
  const [fields, setFields] = useState(() => proposalFields(proposal));
  const [revision, setRevision] = useState(proposal.revision ?? 0);
  const [review, setReview] = useState(false);
  const [errors, setErrors] = useState<ReturnType<typeof validateCareFields>>(
    {},
  );
  const [error, setError] = useState("");
  const records = useMockRecords(space);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const [state, setState] = useMockScreenState(states, "default");
  const { pending, run } = useMockAction();
  const action = useProposalAction(space);
  const dirty =
    !review &&
    JSON.stringify(fields) !== JSON.stringify(proposalFields(proposal));
  const { blocker, allowNavigation } = useUnsavedChanges(dirty);
  const back = () =>
    void navigate(withReturn(proposalReviewPath(space.id, proposal.recordId)));
  const missing =
    state === "source-deleted" ||
    !records.some((record) => record.id === proposal.recordId);
  const busy = pending || action.pending;
  const timeScreen = useTimeSelectionScreen(
    proposal.kind === "schedule" && !review && !missing,
  );
  function save() {
    const nextErrors = validateCareFields(proposal.kind, fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    run(() => {
      if (state === "save-error" || state === "changed") {
        setError(
          state === "changed"
            ? "제안이 바뀌었어요. 최신 제안을 다시 확인해 주세요."
            : "수정 내용을 저장하지 못했어요. 입력한 내용은 그대로 있어요.",
        );
        setState("default");
        return;
      }
      const result = mockProposals.revise(space, proposal.id, revision, {
        fields,
      });
      if (!result.ok) {
        setError(
          "제안의 상태와 근거를 다시 확인해 주세요. 입력한 내용은 유지돼요.",
        );
        return;
      }
      setRevision(revision + 1);
      setError("");
      setReview(true);
      window.scrollTo(0, 0);
    });
  }
  function proceed() {
    const selection = [
      {
        id: proposal.id,
        version: proposal.targetVersion,
        revision: proposal.revision ?? 0,
      },
    ];
    if (space.role === "owner")
      allowNavigation(
        () =>
          void navigate(withReturn(proposalConfirmPath(space.id)), {
            state: { recordId: proposal.recordId, selection },
          }),
      );
    else
      action.submit(selection, "request", (id) =>
        allowNavigation(
          () => void navigate(withReturn(proposalRequestPath(space.id, id))),
        ),
      );
  }
  const unsavedDialog = (
    <UnsavedChangesDialog
      open={blocker.state === "blocked"}
      onStay={() => blocker.reset?.()}
      onLeave={() => blocker.proceed?.()}
    />
  );
  if (timeScreen.open)
    return (
      <>
        <CareTimeSelection
          initialValue={fields.time}
          onConfirm={(time) => {
            setFields((previous) => ({ ...previous, time }));
            timeScreen.close();
          }}
          onBack={timeScreen.close}
          renderLayout={({ content, actions }) => (
            <ProposalPageLayout
              title="시간 선택"
              spaceId={space.id}
              onBack={timeScreen.close}
              actions={actions}
            >
              {content}
            </ProposalPageLayout>
          )}
        />
        {unsavedDialog}
      </>
    );
  return (
    <ProposalPageLayout
      title={review ? "수정한 제안 확인" : "제안 내용 수정"}
      spaceId={space.id}
      onBack={back}
      preview={{ value: state, options: states, onChange: setState }}
      actions={
        !missing && (
          <>
            <Button
              loading={busy}
              onClick={review ? proceed : save}
            >
              {review
                ? space.role === "owner"
                  ? "반영할 내용 확인"
                  : "수정한 1건 반영 요청"
                : "수정 내용 확인"}
            </Button>
            <TextAction
              disabled={busy}
              onClick={back}
            >
              {review ? "검토로 돌아가기" : "수정 취소"}
            </TextAction>
          </>
        )
      }
    >
      {missing ? (
        <EmptyState
          title="이 제안의 근거가 삭제됐어요"
          body="삭제된 내용은 표시하지 않아요. 유효한 근거를 확인하기 전에는 반영할 수 없어요."
          action={{
            label: "확인할 내용으로",
            onClick: () =>
              allowNavigation(
                () => void navigate(withReturn(proposalListPath(space.id))),
              ),
          }}
        />
      ) : (
        <>
          <Badge
            className="self-start"
            label={review ? "내가 수정한 제안" : proposal.typeLabel}
            tone={review ? "brand" : "neutral"}
          />
          <h1 className="text-hm-title-page">
            {review
              ? space.role === "owner"
                ? "반영할 내용을 확인해 주세요"
                : "이 내용으로 요청할까요?"
              : "반영할 내용을 다듬어 주세요"}
          </h1>
          {error && (
            <Notice
              role="alert"
              tone="error"
              title="다시 확인해 주세요"
              body={error}
            />
          )}
          {action.failure && (
            <Notice
              role="alert"
              tone="error"
              title="요청하지 못했어요"
              body="현재 정보는 그대로예요. 제안과 근거를 확인한 뒤 다시 요청해 주세요."
            />
          )}
          {review ? (
            <>
              <ProposalSummaryCard
                members={space.members}
                proposal={proposal}
                label="수정 내용"
                meta={proposal.context}
              />
              <Button
                variant="outline"
                onClick={() => setReview(false)}
              >
                제안 내용 다시 수정
              </Button>
              <Notice
                title="최종 반영 전에는 그대로예요"
                body="수정한 제안은 현재 돌봄 정보와 달라요. 소유자가 최종 반영하기 전까지 현재 정보는 유지돼요."
              />
            </>
          ) : (
            <>
              <p className="text-hm-body-default text-hm-text-secondary">
                현재 돌봄 정보는 아직 바뀌지 않았어요.
              </p>
              <CareFieldsForm
                kind={proposal.kind}
                fields={fields}
                onChange={setFields}
                onTimeSelect={timeScreen.show}
                members={space.members}
                errors={errors}
                disabled={busy}
              />
            </>
          )}
          <ProposalSources
            proposals={[proposal]}
            records={records}
            onSource={(id) =>
              void navigate(withReturn(newsDetailPath(space.id, id)))
            }
          />
        </>
      )}
      {unsavedDialog}
    </ProposalPageLayout>
  );
}
