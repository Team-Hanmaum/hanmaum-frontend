import { useRef } from "react";
import { useParams } from "react-router";
import { Button, TextAction } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { useRecordDetail } from "@/features/record/model/useRecords";
import {
  useDeleteRecord,
  useRecordDeletionImpact,
} from "@/features/record/model/useRecordDeletion";
import type { DeleteRecordBody } from "@/features/record/api/recordDeletionTypes";
import { toRecordView } from "@/features/record/model/recordView";
import { RecordOriginalCard } from "@/features/record/ui/RecordOriginalCard";
import { RecordDeletionImpact } from "@/features/record/ui/RecordDeletionImpact";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import {
  canRetryReview,
  reviewFailure,
} from "@/features/proposal/model/reviewFailure";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { newsDetailPath, newsDeletionPath, spacePath } from "@/routes/paths";

export function ConnectedNewsDeletePage() {
  const { space } = useConnectedSpace();
  const { recordId = "" } = useParams();
  const detail = useRecordDetail(space.spaceId, recordId);
  const impact = useRecordDeletionImpact(space.spaceId, recordId);
  const deletion = useDeleteRecord(space.spaceId, recordId);
  const attempt = useRef<DeleteRecordBody | null>(null);
  const sending = useRef(false);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const uncertain = deletion.isError && canRetryReview(deletion.error);
  const { blocker, allowNavigation } = useUnsavedChanges(
    deletion.isPending || uncertain,
  );
  const back = () =>
    void navigate(withReturn(newsDetailPath(space.spaceId, recordId)), {
      motion: "back",
    });
  const list = () =>
    void navigate(withReturn(spacePath(space.spaceId, "news")), {
      motion: "back",
    });
  const ready =
    !!detail.data?.canDelete &&
    !!impact.data &&
    !detail.isError &&
    !impact.isError &&
    !detail.isFetching &&
    !impact.isFetching &&
    detail.data.version === impact.data.recordVersion;
  function reload() {
    if (sending.current || uncertain) return;
    attempt.current = null;
    deletion.reset();
    void Promise.all([detail.refetch(), impact.refetch()]);
  }
  function remove() {
    if (sending.current || (!uncertain && !ready)) return;
    // 응답이 유실되면 사용자가 확인한 버전·영향·요청 ID 그대로 결과를 재확인한다.
    attempt.current ??= {
      expectedRecordVersion: impact.data!.recordVersion,
      impactToken: impact.data!.impactToken,
      clientRequestId: crypto.randomUUID(),
    };
    sending.current = true;
    deletion.mutate(attempt.current, {
      onSuccess: () =>
        allowNavigation(
          () =>
            void navigate(
              withReturn(newsDeletionPath(space.spaceId, recordId)),
              { replace: true },
            ),
        ),
      onSettled: () => {
        sending.current = false;
      },
    });
  }
  return (
    <ProposalPageLayout
      title="소식 원본 삭제"
      spaceId={space.spaceId}
      onBack={back}
      actions={
        <>
          {(!deletion.isError || uncertain) && (
            <Button
              variant="destructive"
              loading={deletion.isPending}
              disabled={!uncertain && !ready}
              onClick={remove}
            >
              {uncertain ? "같은 삭제 요청으로 결과 확인" : "소식 원본 삭제"}
            </Button>
          )}
          {deletion.isError && !uncertain && (
            <Button onClick={reload}>현재 삭제 영향 다시 확인</Button>
          )}
          <TextAction
            disabled={deletion.isPending}
            onClick={deletion.isError ? list : back}
          >
            {deletion.isError ? "소식 목록으로" : "취소"}
          </TextAction>
        </>
      }
    >
      <h1 className="text-hm-title-page">
        {uncertain
          ? "삭제 결과가 아직 확인되지 않았어요"
          : "이 소식을 삭제할까요?"}
      </h1>
      {deletion.isError ? (
        <Notice
          role="alert"
          tone="error"
          title={uncertain ? "결과를 다시 확인해 주세요" : "삭제하지 못했어요"}
          body={
            uncertain
              ? "요청이 처리됐을 수 있어요. 같은 요청으로 다시 확인하면 중복 삭제 없이 결과를 확인해요."
              : deletion.error.status === 409
                ? "소식이나 연결된 항목이 바뀌었어요. 최신 삭제 영향을 다시 확인하고 결정해 주세요."
                : reviewFailure(deletion.error)
          }
        />
      ) : null}
      {!deletion.isPending &&
      !deletion.isSuccess &&
      !deletion.isError &&
      (!detail.data || !impact.data || detail.isError || impact.isError) ? (
        <ReviewQueryState
          error={detail.error ?? impact.error}
          retry={reload}
        />
      ) : !deletion.isPending &&
        !deletion.isSuccess &&
        !deletion.isError &&
        detail.data &&
        impact.data ? (
        <>
          <p className="text-hm-body-default text-hm-text-secondary">
            소식 원문과 다른 곳에 복사된 이 소식의 내용도 함께 삭제돼요.
          </p>
          <RecordOriginalCard
            record={toRecordView(detail.data, space.spaceId)}
          />
          <RecordDeletionImpact impact={impact.data} />
          {!detail.data.canDelete && (
            <Notice
              title="지금은 삭제할 수 없어요"
              body="현재 참여 중인 작성자와 소유자만 소식 원본을 삭제할 수 있어요."
            />
          )}
          {detail.data.version !== impact.data.recordVersion && (
            <Notice
              title="소식이 변경됐어요"
              body="최신 내용과 삭제 영향을 다시 확인해 주세요."
            />
          )}
          <TextAction
            disabled={detail.isFetching || impact.isFetching}
            onClick={reload}
          >
            최신 삭제 영향 확인
          </TextAction>
        </>
      ) : null}
      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        title="삭제 결과 확인을 나갈까요?"
        body="처리 중인 삭제는 취소되지 않아요. 이 화면을 나가면 같은 요청으로 결과를 확인할 수 없어요."
        confirmLabel="확인 종료"
        cancelLabel="계속 확인"
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />
    </ProposalPageLayout>
  );
}
