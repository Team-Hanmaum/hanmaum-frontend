import {
  Badge,
  Button,
  Field,
  SelectionRow,
  TextAction,
} from "@/components/ui";
import { Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import type { CareDetail } from "../api/careReadTypes";
import type { SpaceDetail } from "@/features/carespace/api/spaceDetailTypes";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { reviewFailure } from "@/features/proposal/model/reviewFailure";
import { useCareEvidence } from "../model/useCareQueries";
import { useCareReconfirmation } from "../model/useCareReconfirmation";
import { itemLabels } from "../model/careReadView";
import { CareReconfirmationInputs } from "./CareReconfirmationInputs";
import { CareValuesView } from "./CareValuesView";
import { CareSection } from "./CareSection";
import { CareTimeSelection } from "./CareTimeSelection";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { useTimeSelectionScreen } from "@/routes/useTimeSelectionScreen";
import { careItemPath } from "@/routes/paths";

export function CareReconfirmationForm({
  space,
  item,
  queryError,
  reload,
}: {
  space: SpaceDetail;
  item: CareDetail;
  queryError: unknown;
  reload: () => void;
}) {
  const evidence = useCareEvidence(space.spaceId, item.itemId);
  const members = useSpaceMembers(space.spaceId);
  const form = useCareReconfirmation(
    space.spaceId,
    item,
    evidence.data?.items ?? [],
  );
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const { blocker, allowNavigation } = useUnsavedChanges(
    form.dirty || form.frozen,
  );
  const back = () =>
    void navigate(withReturn(careItemPath(space.spaceId, item.itemId)), {
      motion: "back",
    });
  const complete = () =>
    allowNavigation(
      () =>
        void navigate(withReturn(careItemPath(space.spaceId, item.itemId)), {
          replace: true,
        }),
    );
  const timeScreen = useTimeSelectionScreen(
    item.itemType === "SCHEDULE" && !form.review,
  );
  const blocked =
    !!queryError ||
    form.changed ||
    !form.leases.ready ||
    (form.draft.evidenceIds.length > 0 && evidence.isError);
  const validEvidence = evidence.isError
    ? []
    : (evidence.data?.items ?? []).filter((entry) => entry.status === "VALID");
  const dialog = (
    <UnsavedChangesDialog
      open={blocker.state === "blocked"}
      {...(form.frozen && {
        title: "재확인 결과 확인을 나갈까요?",
        body: "이미 보낸 요청은 취소되지 않아요. 결과를 확인하지 않고 나가면 항목의 현재 상태를 다시 확인해야 해요.",
        confirmLabel: "확인 종료",
        cancelLabel: "계속 확인",
      })}
      onStay={() => blocker.reset?.()}
      onLeave={() => blocker.proceed?.()}
    />
  );
  if (timeScreen.open)
    return (
      <>
        <CareTimeSelection
          initialValue={form.draft.fields.time}
          onConfirm={(time) => {
            form.update({
              ...form.draft,
              fields: { ...form.draft.fields, time },
            });
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
      title={form.review ? "반영 전 확인" : "다시 확인하기"}
      spaceId={space.spaceId}
      onBack={back}
      actions={
        <>
          <Button
            loading={form.mutation.isPending}
            disabled={!form.retry && (blocked || form.mutation.isError)}
            onClick={
              form.review
                ? () => form.submit(complete)
                : () => {
                    form.confirm();
                    window.scrollTo(0, 0);
                  }
            }
          >
            {form.retry
              ? "같은 요청으로 결과 확인"
              : form.review
                ? "이 내용으로 다시 확인"
                : "반영할 내용 확인"}
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
        label={`${itemLabels[item.itemType]} · 근거 재확인`}
        className="self-start"
      />
      <h1 className="text-hm-title-page">
        {form.review
          ? "이 내용으로 다시 확인할까요?"
          : "새로 확인한 내용을 남겨 주세요"}
      </h1>
      <Notice
        title="삭제된 내용은 복원하지 않아요"
        body="직접 확인한 값과 유효한 근거로 다시 구성해요. 일정·할 일·질문의 기존 상태는 유지돼요."
      />
      {(form.error || form.mutation.isError) && (
        <Notice
          role="alert"
          tone="error"
          title="재확인 결과를 확인해 주세요"
          body={
            form.mutation.isError
              ? reviewFailure(form.mutation.error)
              : form.error
          }
        />
      )}
      {blocked && (
        <Notice
          role="status"
          title={
            form.leases.error
              ? reviewFailure(form.leases.error)
              : form.changed
                ? "확인 중 항목 정보가 바뀌었어요"
                : queryError
                  ? "최신 정보를 불러오지 못했어요"
                  : evidence.isError
                    ? "선택한 근거를 다시 확인해 주세요"
                    : "편집 가능 여부를 확인하고 있어요"
          }
          body="입력은 자동으로 바꾸지 않아요. 최신 내용으로 다시 시작하면 입력을 새로 작성해야 해요."
        />
      )}
      {!form.frozen &&
        (form.changed ||
          form.leases.error ||
          queryError ||
          form.mutation.isError) && (
          <TextAction
            onClick={() =>
              void form.leases.release().then(reload, () => {
                /* 해제 실패는 leases.error로 표시 */
              })
            }
          >
            입력을 버리고 최신 내용으로 다시 시작
          </TextAction>
        )}
      {form.review ? (
        <>
          <CareSection title="반영할 내용">
            <CareValuesView
              values={form.values}
              members={members.data}
            />
          </CareSection>
          {form.draft.basis.trim() && (
            <CareSection title="새로 확인한 근거">
              {form.draft.basis}
            </CareSection>
          )}
          {validEvidence
            .filter((entry) =>
              form.draft.evidenceIds.includes(entry.evidenceId),
            )
            .map((entry) => (
              <CareSection
                key={entry.evidenceId}
                title="선택한 유효 근거"
              >
                {entry.text || "근거 본문 없음"}
              </CareSection>
            ))}
        </>
      ) : (
        <>
          <CareReconfirmationInputs
            item={form.item}
            draft={form.draft}
            update={form.update}
            members={members.data ?? []}
            disabled={form.frozen}
            onTime={timeScreen.show}
          />
          {members.isError && (
            <TextAction onClick={() => void members.refetch()}>
              담당자 목록 다시 확인
            </TextAction>
          )}
          <Field
            multiline
            rows={5}
            label="어떻게 확인했나요?"
            helper="새로 확인한 방법과 내용을 적어 주세요. 기존 근거만 선택한다면 모든 입력값을 뒷받침해야 해요."
            maxLength={10000}
            value={form.draft.basis}
            onChange={(event) =>
              form.update({ ...form.draft, basis: event.target.value })
            }
            disabled={form.frozen}
          />
          <h2 className="text-hm-heading-section">남아 있는 유효 근거</h2>
          {evidence.isError ? (
            <Notice
              tone="error"
              title="기존 근거를 불러오지 못했어요"
              body="다시 불러오거나, 직접 확인한 새 근거로 진행해 주세요."
            />
          ) : evidence.isPending ? (
            <p role="status">기존 근거를 확인하고 있어요.</p>
          ) : !validEvidence.length ? (
            <p className="text-hm-body-default">
              선택할 유효 근거가 없어요. 새로 확인한 근거를 입력해 주세요.
            </p>
          ) : (
            validEvidence.map((entry, index) => (
              <SelectionRow
                key={entry.evidenceId}
                control="checkbox"
                label={`유효 근거 ${index + 1}`}
                description={entry.text || "근거 본문 없음"}
                checked={form.draft.evidenceIds.includes(entry.evidenceId)}
                disabled={form.frozen}
                onChange={() =>
                  form.update({
                    ...form.draft,
                    evidenceIds: form.draft.evidenceIds.includes(
                      entry.evidenceId,
                    )
                      ? form.draft.evidenceIds.filter(
                          (id) => id !== entry.evidenceId,
                        )
                      : [...form.draft.evidenceIds, entry.evidenceId],
                  })
                }
              />
            ))
          )}
        </>
      )}
      {evidence.isError && (
        <TextAction
          disabled={form.frozen}
          onClick={() => void evidence.refetch()}
        >
          유효 근거 다시 불러오기
        </TextAction>
      )}
      {dialog}
    </ProposalPageLayout>
  );
}
