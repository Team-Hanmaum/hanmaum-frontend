import { Button, Badge, TextAction, MenuRow, Field } from "@/components/ui";
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
import { CareValuesView } from "./CareValuesView";
import { CareTimeSelection } from "./CareTimeSelection";
import { flattenCareValues } from "../model/careReadView";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { useTimeSelectionScreen } from "@/routes/useTimeSelectionScreen";
import {
  careItemPath,
  careListPath,
  careSourcesPath,
  proposalRequestPath,
} from "@/routes/paths";

export function CareEditForm({
  space,
  item,
  operation,
  queryError,
  reload,
}: {
  space: SpaceDetail;
  item: CareDetail;
  operation: EditOperation;
  queryError: unknown;
  reload: () => void;
}) {
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const form = useCareEdit(space, item, operation);
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
  const back = () =>
    void navigate(withReturn(careItemPath(space.spaceId, item.itemId)), {
      motion: "back",
    });
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
      title={form.review ? "내용 확인" : title}
      spaceId={space.spaceId}
      onBack={back}
      actions={
        <>
          <Button
            variant={operation === "delete" ? "destructive" : "primary"}
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
          <TextAction
            disabled={form.frozen}
            onClick={form.review && operation !== "delete" ? form.edit : back}
          >
            {form.review && operation !== "delete"
              ? "내용 다시 수정"
              : "돌아가기"}
          </TextAction>
        </>
      }
    >
      <Badge
        label={
          form.review ? (form.direct ? "최종 확인" : "승인 요청") : "수정 중"
        }
      />
      <h1 className="text-hm-title-page">
        {form.review
          ? operation === "delete"
            ? "이 항목을 삭제할까요?"
            : "이 내용으로 진행할까요?"
          : operation === "assignee"
            ? "누가 챙길까요?"
            : operation === "status"
              ? "상태를 어떻게 바꿀까요?"
              : operation === "answer"
                ? "확인한 내용을 알려주세요"
                : "무엇이 달라졌나요?"}
      </h1>
      {(form.error || form.mutation.isError) && (
        <Notice
          role="alert"
          tone="error"
          title="변경 결과를 확인해 주세요"
          body={
            form.mutation.isError
              ? reviewFailure(form.mutation.error)
              : form.error
          }
        />
      )}
      {(blocked || members.isError) && (
        <Notice
          role="status"
          title={
            form.changed
              ? "검토 중 현재 정보가 바뀌었어요"
              : form.leases.error
                ? reviewFailure(form.leases.error)
                : queryError
                  ? "최신 내용을 불러오지 못했어요"
                  : members.isError
                    ? "담당자 목록을 불러오지 못했어요"
                    : "편집 가능 여부를 확인하고 있어요"
          }
          body="입력은 자동으로 바꾸지 않아요. 최신 내용에서 다시 시작하려면 입력을 다시 작성해야 해요."
        />
      )}
      {!form.frozen &&
        (form.changed ||
          form.needsRefresh ||
          !!form.leases.error ||
          !!queryError) && (
          <TextAction onClick={() => void form.leases.release().then(reload)}>
            입력을 버리고 최신 내용으로 다시 시작
          </TextAction>
        )}
      {members.isError && (
        <TextAction onClick={() => void members.refetch()}>
          담당자 다시 불러오기
        </TextAction>
      )}
      {operation === "delete" ? (
        <>
          <CareSection title="삭제할 항목">
            {item.title ?? "내용이 제거된 항목"}
          </CareSection>
          <Notice
            title="돌봄 목록과 홈에서 숨겨져요"
            body="소식 원본과 변경 이력은 유지돼요. 공유된 링크에서는 항목 상세를 볼 수 없어요."
          />
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
      )}
      <Notice
        title={form.direct ? "확인 후 반영해요" : "현재 돌봄 정보는 그대로예요"}
        body={
          form.direct
            ? "변경 이력과 돌봄 목록·홈을 함께 갱신해요."
            : operation === "answer"
              ? "답변은 승인 대기로 저장돼요. 소유자가 승인하기 전까지 질문은 미확인 상태를 유지해요."
              : "소유자가 요청을 확인하고 승인한 뒤 반영해요."
        }
      />
      {operation === "edit" && (
        <MenuRow
          icon="link-brand"
          title="기존 근거 보기"
          onClick={() =>
            void navigate(
              withReturn(careSourcesPath(space.spaceId, item.itemId)),
            )
          }
        />
      )}
      {dialog}
    </ProposalPageLayout>
  );
}
