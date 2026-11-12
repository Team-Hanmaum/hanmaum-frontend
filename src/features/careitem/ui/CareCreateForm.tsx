import { useRef, useState } from "react";
import { Button, Badge, TextAction } from "@/components/ui";
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
import type { CareItemKind } from "../model/careItemViewTypes";
import { CareFieldsForm } from "./CareFieldsForm";
import { CareValuesView } from "./CareValuesView";
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
  function confirm() {
    const message = writeFieldError(fields);
    setError(message);
    if (!message) setReview(true);
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
              connected
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
      connected
      title={review ? "내용 확인" : `${itemLabels[type]} 추가`}
      spaceId={space.spaceId}
      onBack={back}
      actions={
        <>
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
          <TextAction
            disabled={frozen}
            onClick={() => {
              if (review) {
                setReview(false);
                mutation.reset();
                attempt.current = null;
              } else back();
            }}
          >
            {review ? "내용 다시 수정" : "돌아가기"}
          </TextAction>
        </>
      }
    >
      <Badge
        label={
          review
            ? direct
              ? "최종 확인"
              : "승인 요청"
            : `${space.subjectLabel}의 돌봄`
        }
      />
      <h1 className="text-hm-title-page">
        {review
          ? direct
            ? "이 내용으로 등록할까요?"
            : "이 내용으로 요청할까요?"
          : type === "SCHEDULE"
            ? "어떤 일정인가요?"
            : type === "TASK"
              ? "무엇을 챙겨야 하나요?"
              : "무엇을 확인해야 하나요?"}
      </h1>
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
        <CareValuesView
          values={createItemValues(type, fields)}
          members={members.data}
          keys={
            type === "SCHEDULE"
              ? [
                  "title",
                  "scheduledDate",
                  "scheduledTime",
                  "location",
                  "description",
                ]
              : type === "TASK"
                ? ["title", "description", "assigneeMembershipId", "dueDate"]
                : ["title", "description"]
          }
        />
      ) : (
        <CareFieldsForm
          apiMode
          direct
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
          errors={error ? { title: error } : undefined}
        />
      )}
      <Notice
        title={direct ? "확인 후 바로 등록해요" : "소유자의 확인 후 반영해요"}
        body={
          direct
            ? "등록한 내용은 돌봄 목록과 홈에 반영돼요."
            : "등록 요청을 보내도 승인 전까지 현재 돌봄 정보는 그대로예요."
        }
      />
      {dialog}
    </ProposalPageLayout>
  );
}
