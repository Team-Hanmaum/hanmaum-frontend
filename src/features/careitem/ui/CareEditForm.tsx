import { Button, Badge, TextAction, MenuRow } from "@/components/ui";
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
            loading={form.mutation.isPending}
            disabled={!form.retry && (blocked || form.mutation.isError)}
            onClick={form.review ? () => form.submit(complete) : form.confirm}
          >
            {form.retry
              ? "같은 요청으로 다시 확인"
              : form.review
                ? `${title}${form.direct ? " 반영" : " 요청"}`
                : "변경 내용 확인"}
          </Button>
          <TextAction
            disabled={form.frozen}
            onClick={form.review ? form.edit : back}
          >
            {form.review ? "내용 다시 수정" : "돌아가기"}
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
          ? "이 내용으로 진행할까요?"
          : operation === "assignee"
            ? "누가 챙길까요?"
            : operation === "status"
              ? "상태를 어떻게 바꿀까요?"
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
        (form.changed || !!form.leases.error || !!queryError) && (
          <TextAction onClick={() => void form.leases.release().then(reload)}>
            입력을 버리고 최신 내용으로 다시 시작
          </TextAction>
        )}
      {members.isError && (
        <TextAction onClick={() => void members.refetch()}>
          담당자 다시 불러오기
        </TextAction>
      )}
      {form.review ? (
        <CareValuesView
          before={form.item}
          values={form.values}
          keys={Object.keys(flattenCareValues(form.values))}
          members={members.data}
        />
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
