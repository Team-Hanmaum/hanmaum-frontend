import { useState } from "react";
import { Button, Badge, TextAction, Icon, Field } from "@/components/ui";
import { CareSection } from "./CareSection";
import type { CareItemKind } from "../model/careItemViewTypes";
import { Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import type { CareDetail } from "../api/careReadTypes";
import type { SpaceDetail } from "@/features/carespace/api/spaceDetailTypes";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { useCareEdit, type EditOperation } from "../model/useCareEdit";
import { reviewFailure } from "@/features/proposal/model/reviewFailure";
import { CareEditInputs } from "./CareEditInputs";
import { CareEvidenceList } from "./CareEvidenceList";
import { CareValuesView } from "./CareValuesView";
import { CareReconfirmationMetadata } from "./CareReconfirmationMetadata";
import { CareTimeSelection } from "./CareTimeSelection";
import { careItemTitle, flattenCareValues } from "../model/careReadView";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { useTimeSelectionScreen } from "@/routes/useTimeSelectionScreen";
import {
  careItemPath,
  careListPath,
  proposalRequestPath,
} from "@/routes/paths";

export function CareEditForm({
  space,
  item,
  operation,
  queryError,
  reload,
  onBack,
}: {
  space: SpaceDetail;
  item: CareDetail;
  operation: EditOperation;
  queryError: unknown;
  reload: () => void;
  onBack: () => void;
}) {
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const form = useCareEdit(space, item, operation);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const deleting = operation === "delete";
  const { blocker, allowNavigation } = useUnsavedChanges(form.dirty);
  const complete = (requestId?: string) =>
    allowNavigation(
      () =>
        void navigate(
          withReturn(
            requestId
              ? proposalRequestPath(space.spaceId, requestId)
              : operation === "delete"
                ? careListPath(space.spaceId, {
                    type: item.itemType.toLowerCase() as CareItemKind,
                  })
                : careItemPath(space.spaceId, item.itemId),
          ),
          { replace: true },
        ),
    );
  const members = useSpaceMembers(space.spaceId);
  const timeScreen = useTimeSelectionScreen(
    item.itemType === "SCHEDULE" && !form.review,
  );
  const title =
    operation === "edit"
      ? "내용 변경"
      : operation === "assignee"
        ? "담당자 변경"
        : operation === "answer"
          ? "답변 제출"
          : operation === "delete"
            ? "항목 삭제"
            : "상태 변경";
  const blocked = !!queryError || form.changed || !form.leases.ready;
  const membersFailed = !deleting && members.isError;
  const submitAction = (
    <Button
      variant={deleting ? "destructive" : "primary"}
      loading={form.mutation.isPending}
      disabled={!form.retry && (blocked || form.mutation.isError)}
      onClick={form.review ? () => form.submit(complete) : form.confirm}
    >
      {form.retry
        ? "같은 요청으로 다시 확인"
        : form.review
          ? operation === "answer"
            ? "답변 제출하기"
            : `${title}${form.direct ? "" : " 요청"}`
          : operation === "answer"
            ? "답변 내용 확인"
            : "변경 내용 확인"}
    </Button>
  );
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
          initialValue={form.fields.time}
          onConfirm={(time) => {
            form.setFields({ ...form.fields, time });
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
      title={
        deleting
          ? form.direct
            ? title
            : "삭제 요청"
          : form.review
            ? "내용 확인"
            : title
      }
      spaceId={space.spaceId}
      onBack={onBack}
      actions={
        <div className="grid grid-cols-2 gap-hm-12">
          <Button
            variant="outline"
            disabled={form.frozen}
            onClick={form.review && !deleting ? form.edit : onBack}
          >
            {form.review && !deleting ? "다시 수정" : "돌아가기"}
          </Button>
          {submitAction}
        </div>
      }
    >
      {!deleting && form.review && !form.direct && (
        <Badge
          tone="brand"
          className="self-start"
          label="승인 요청"
        />
      )}
      <h1 className="text-hm-title-page">
        {form.review
          ? deleting
            ? form.direct
              ? "이 항목을 삭제할까요?"
              : "이 항목의 삭제를 요청할까요?"
            : "이 내용으로 진행할까요?"
          : operation === "assignee"
            ? "누가 챙길까요?"
            : operation === "status"
              ? "상태를 어떻게 바꿀까요?"
              : operation === "answer"
                ? "확인한 내용을 알려주세요"
                : "내용을 수정해 주세요"}
      </h1>
      {(form.error || form.mutation.isError) && (
        <Notice
          role="alert"
          tone="error"
          title={
            deleting ? "삭제 결과를 확인해 주세요" : "변경 결과를 확인해 주세요"
          }
          body={
            form.mutation.isError
              ? reviewFailure(form.mutation.error)
              : form.error
          }
        />
      )}
      {(blocked || membersFailed) && (
        <Notice
          role="status"
          title={
            form.leases.error
              ? reviewFailure(form.leases.error)
              : form.changed
                ? "검토 중 현재 정보가 바뀌었어요"
                : queryError
                  ? "최신 내용을 불러오지 못했어요"
                  : membersFailed
                    ? "담당자 목록을 불러오지 못했어요"
                    : "편집 가능 여부를 확인하고 있어요"
          }
          body={
            deleting
              ? "항목의 최신 상태와 삭제 가능 여부를 확인해요."
              : "입력은 자동으로 바꾸지 않아요. 최신 내용에서 다시 시작하려면 입력을 다시 작성해야 해요."
          }
        />
      )}
      {!form.frozen &&
        (form.changed ||
          form.needsRefresh ||
          !!form.leases.error ||
          !!queryError) && (
          <TextAction
            onClick={() =>
              void form.leases.release().then(reload, () => {
                // 해제 오류는 leases.error로 표시하고 현재 입력 화면을 유지한다.
              })
            }
          >
            {deleting
              ? "최신 내용 다시 확인"
              : "입력을 버리고 최신 내용으로 다시 시작"}
          </TextAction>
        )}
      {membersFailed && (
        <TextAction onClick={() => void members.refetch()}>
          담당자 다시 불러오기
        </TextAction>
      )}
      {deleting ? (
        <>
          <section className="flex flex-col gap-hm-8 rounded-hm-16 bg-hm-bg-surface p-hm-16">
            <h2 className="text-hm-heading-section wrap-anywhere">
              {careItemTitle(item)}
            </h2>
            {item.needsReconfirmation && (
              <CareReconfirmationMetadata item={item} />
            )}
          </section>
          <p className="text-hm-body-small text-hm-text-secondary">
            {form.direct ? "삭제하면" : "소유자가 요청을 승인하면"} 돌봄 목록과
            홈에서 항목이 숨겨지고 공유 링크에서 상세를 볼 수 없어요. 소식
            원본과 변경 이력은 유지돼요.
          </p>
        </>
      ) : form.review ? (
        <CareValuesView
          before={operation === "answer" ? undefined : form.item}
          values={form.values}
          keys={Object.keys(flattenCareValues(form.values))}
          members={members.data}
        />
      ) : operation === "answer" ? (
        <>
          <CareSection title="질문">{item.title}</CareSection>
          <Field
            multiline
            rows={5}
            label="답변"
            value={form.answer}
            onChange={(event) => form.setAnswer(event.target.value)}
            maxLength={10000}
            disabled={form.frozen}
          />
          <Field
            multiline
            rows={5}
            label="어떻게 확인했나요?"
            value={form.basis}
            onChange={(event) => form.setBasis(event.target.value)}
            maxLength={10000}
            disabled={form.frozen}
          />
        </>
      ) : (
        <div className="flex flex-col gap-hm-16">
          <CareEditInputs
            item={form.item}
            operation={operation}
            fields={form.fields}
            onChange={form.setFields}
            status={form.status}
            onStatus={form.setStatus}
            members={members.data ?? []}
            onTime={timeScreen.show}
            disabled={form.frozen}
          />
        </div>
      )}
      {!deleting && form.review && !form.direct && (
        <Notice
          title="소유자가 확인해요"
          body={
            operation === "answer"
              ? "답변은 승인 대기로 저장돼요. 소유자가 승인하기 전까지 질문은 미확인 상태를 유지해요."
              : "소유자가 요청을 확인하고 승인한 뒤 반영해요."
          }
        />
      )}
      {operation === "edit" && !form.review && (
        <details
          className="group rounded-hm-12 border border-hm-border-default"
          open={evidenceOpen}
          onToggle={(event) => setEvidenceOpen(event.currentTarget.open)}
        >
          <summary className="hm-focus-ring flex min-h-hm-touch-min cursor-pointer list-none items-center justify-between gap-hm-8 rounded-hm-12 px-hm-16 py-hm-8 text-hm-body-small font-bold text-hm-text-brand [&::-webkit-details-marker]:hidden">
            기존 근거 보기
            <span className="inline-flex group-open:rotate-90">
              <Icon name="chevron-right-secondary" />
            </span>
          </summary>
          {evidenceOpen && (
            <div className="px-hm-8 pb-hm-8">
              <CareEvidenceList
                spaceId={space.spaceId}
                itemId={item.itemId}
                expanded
              />
            </div>
          )}
        </details>
      )}
      {dialog}
    </ProposalPageLayout>
  );
}
