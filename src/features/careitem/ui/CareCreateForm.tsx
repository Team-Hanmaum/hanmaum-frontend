import { useRef, useState } from "react";
import { Button, TextAction } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import type { SpaceDetail } from "@/features/carespace/api/spaceDetailTypes";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { createCareItem } from "../api/careWriteApi";
import type {
  CreatableItemType,
  CreateCareItemBody,
} from "../api/careWriteTypes";
import { submitProposalRequest } from "@/features/proposal/api/proposalWriteApi";
import type { RequestSubmissionBody } from "@/features/proposal/api/proposalWriteTypes";
import { useReviewMutation } from "@/features/proposal/model/useReviewMutation";
import {
  reviewFailure,
  canRetryReview,
} from "@/features/proposal/model/reviewFailure";
import {
  emptyWriteFields,
  createItemValues,
  canCreateDirectly,
  writeFieldError,
} from "../model/careWriteDraft";
import { itemLabels } from "../model/careReadView";
import { validateCareFields } from "../model/careItemFields";
import type { CareItemKind } from "../model/careItemViewTypes";
import { CareFieldsForm } from "./CareFieldsForm";
import { CareFieldList } from "./CareFieldList";
import { CareTimeSelection } from "./CareTimeSelection";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useTimeSelectionScreen } from "@/routes/useTimeSelectionScreen";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import {
  careItemPath,
  careListPath,
  proposalRequestPath,
} from "@/routes/paths";

type Attempt =
  | { direct: true; body: CreateCareItemBody }
  | { direct: false; body: RequestSubmissionBody };

const reviewFields: Record<CreatableItemType, readonly string[]> = {
  SCHEDULE: ["scheduledDate", "scheduledTime", "location", "description"],
  TASK: ["assigneeMembershipId", "dueDate", "description"],
  QUESTION: ["description"],
};

export function CareCreateForm({
  space,
  type,
}: {
  space: SpaceDetail;
  type: CreatableItemType;
}) {
  const [fields, setFields] = useState(emptyWriteFields);
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    ReturnType<typeof validateCareFields>
  >({});
  const attempt = useRef<Attempt | null>(null);
  const members = useSpaceMembers(space.spaceId);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const kind = type.toLowerCase() as CareItemKind;
  const timeScreen = useTimeSelectionScreen(type === "SCHEDULE" && !review);
  const { blocker, allowNavigation } = useUnsavedChanges(
    Object.values(fields).some(Boolean),
  );
  const mutation = useReviewMutation(space.spaceId, async (a: Attempt) =>
    a.direct
      ? { itemId: (await createCareItem(space.spaceId, a.body)).itemId }
      : {
          requestId: (await submitProposalRequest(space.spaceId, a.body))
            .requestId,
        },
  );
  const direct = canCreateDirectly(space, type, fields);
  const retry = mutation.isError && canRetryReview(mutation.error);
  const frozen = mutation.isPending || retry;
  const back = () =>
    void navigate(withReturn(careListPath(space.spaceId, { type: kind })), {
      motion: "back",
    });
  function returnToInputs() {
    if (frozen) return;
    setReview(false);
    mutation.reset();
    attempt.current = null;
  }
  function confirm() {
    const next =
      type === "SCHEDULE" ? validateCareFields("schedule", fields) : {};
    const message = writeFieldError(fields);
    if (message) next.title = message;
    setFieldErrors(next);
    setError(message || Object.values(next)[0] || "");
    if (!Object.keys(next).length) setReview(true);
  }
  function submit() {
    if (mutation.isPending) return;
    if (!attempt.current) {
      const values = createItemValues(type, fields);
      const clientRequestId = crypto.randomUUID();
      attempt.current = direct
        ? { direct: true, body: { ...values, clientRequestId } }
        : {
            direct: false,
            body: {
              clientRequestId,
              entries: [
                { sourceType: "DIRECT_INPUT", action: "CREATE_ITEM", values },
              ],
            },
          };
    }
    mutation.mutate(attempt.current, {
      onSuccess: (result) =>
        allowNavigation(
          () =>
            void navigate(
              withReturn(
                "itemId" in result
                  ? careItemPath(space.spaceId, result.itemId!)
                  : proposalRequestPath(space.spaceId, result.requestId!),
              ),
              { replace: true },
            ),
        ),
    });
  }
  const dialog = (
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
            setFields({ ...fields, time });
            timeScreen.close();
          }}
          onBack={timeScreen.close}
          renderLayout={({ content, actions }) => (
            <ProposalPageLayout
              title="시간 선택"
              spaceId={space.spaceId}
              onBack={timeScreen.close}
              actions={actions}
            >
              {content}
            </ProposalPageLayout>
          )}
        />
        {dialog}
      </>
    );
  return (
    <ProposalPageLayout
      title={review ? "내용 확인" : `${itemLabels[type]} 추가`}
      spaceId={space.spaceId}
      onBack={review && !frozen ? returnToInputs : back}
      actions={
        <div className="grid grid-cols-2 gap-hm-8 [&>.hm-button]:px-hm-8">
          <Button
            variant="outline"
            disabled={frozen}
            onClick={review ? returnToInputs : back}
          >
            {review ? "내용 다시 수정" : "돌아가기"}
          </Button>
          <Button
            loading={mutation.isPending}
            disabled={mutation.isError && !retry}
            onClick={review ? submit : confirm}
          >
            {retry
              ? "같은 요청으로 다시 확인"
              : review
                ? direct
                  ? "등록하기"
                  : "등록 요청하기"
                : "입력 내용 확인"}
          </Button>
        </div>
      }
    >
      {!review && (
        <div className="flex flex-col gap-hm-4">
          <h1 className="text-hm-title-page">
            {type === "SCHEDULE"
              ? "어떤 일정인가요?"
              : type === "TASK"
                ? "어떤 할 일인가요?"
                : "무엇을 확인해야 하나요?"}
          </h1>
          <p className="text-hm-body-small wrap-anywhere text-hm-text-secondary">
            {space.subjectLabel}의 돌봄
          </p>
        </div>
      )}
      {(error || mutation.isError) && (
        <Notice
          role="alert"
          tone="error"
          title="등록 결과를 확인해 주세요"
          body={mutation.isError ? reviewFailure(mutation.error) : error}
        />
      )}
      {members.isError && (
        <Notice
          title="담당자 목록을 불러오지 못했어요"
          body="입력은 유지돼요. 목록을 다시 확인해 주세요."
        />
      )}
      {members.isError && (
        <TextAction onClick={() => void members.refetch()}>
          담당자 다시 불러오기
        </TextAction>
      )}
      {review ? (
        <>
          <section className="flex min-w-0 flex-col gap-hm-8 rounded-hm-16 bg-hm-bg-surface p-hm-16">
            <p className="text-hm-caption-default text-hm-text-brand">
              {itemLabels[type]}
            </p>
            <h1 className="text-hm-title-page wrap-anywhere whitespace-pre-wrap">
              {fields.title.trim()}
            </h1>
            <CareFieldList
              values={createItemValues(type, fields)}
              members={members.data}
              keys={reviewFields[type]}
            />
          </section>
          <p className="text-hm-body-small text-hm-text-secondary">
            {direct
              ? "등록하면 가족이 돌봄 목록에서 볼 수 있어요."
              : "소유자가 요청을 확인한 뒤 돌봄 목록에 반영해요."}
          </p>
        </>
      ) : (
        <div className="flex flex-col gap-hm-16 [&_textarea]:resize-none">
          <CareFieldsForm
            apiMode
            direct
            compact
            kind={kind}
            fields={fields}
            onChange={setFields}
            onTimeSelect={timeScreen.show}
            members={(members.data ?? []).map((m) => ({
              id: m.membershipId,
              name: m.displayName || "이름 미설정",
              role: m.role.toLowerCase(),
            }))}
            disabled={frozen}
            errors={fieldErrors}
          />
        </div>
      )}
      {dialog}
    </ProposalPageLayout>
  );
}
