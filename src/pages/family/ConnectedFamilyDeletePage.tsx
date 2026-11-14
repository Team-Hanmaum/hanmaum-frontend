import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { Button, TextAction } from "@/components/ui";
import { useSession } from "@/features/auth/model/useSession";
import {
  deleteCareSpace,
  getSpaceDeletionImpact,
} from "@/features/carespace/api/familyManagementApi";
import type {
  DeleteCareSpaceBody,
  DeleteCareSpaceResult,
} from "@/features/carespace/api/familyManagementTypes";
import { familyActionFailure } from "@/features/carespace/model/familyActionFailure";
import { endFamilyAccess } from "@/features/carespace/model/familyCache";
import { useFamilyAction } from "@/features/carespace/model/useFamilyAction";
import { useFamilyManagement } from "@/features/carespace/model/useFamilyManagement";
import { FamilyInfoCard } from "@/features/carespace/ui/FamilyInfoCard";
import { ApiError } from "@/lib/api";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import { familyLeavePath, familyTransferPath, paths } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function ConnectedFamilyDeletePage() {
  const management = useFamilyManagement();
  const { spaceId, space } = management;
  const session = useSession();
  const client = useQueryClient();
  const navigate = useAppNavigate();
  const { withdrawing, withReturn, returnToWithdrawal } = useWithdrawalReturn();
  const onBack = useBackNavigation(familyLeavePath(spaceId));
  const deletion = useFamilyAction<DeleteCareSpaceBody, DeleteCareSpaceResult>(
    (body) => deleteCareSpace(spaceId, body),
  );
  const impact = useQuery({
    queryKey: ["carespace", session.accountId, spaceId, "deletion-impact"],
    queryFn: ({ signal }) => getSpaceDeletionImpact(spaceId, signal),
    enabled:
      session.status === "authenticated" &&
      space?.role === "OWNER" &&
      !deletion.pending &&
      !deletion.uncertain &&
      !deletion.result,
    staleTime: 0,
  });
  const { blocker, allowNavigation } = useUnsavedChanges(
    deletion.pending || deletion.uncertain,
  );
  const denied = [management.error, impact.error, deletion.error].find(
    (error) =>
      error instanceof ApiError && [403, 404].includes(error.status ?? 0),
  );
  const ready =
    space?.role === "OWNER" &&
    !!impact.data &&
    !management.error &&
    !management.refreshing &&
    !impact.isError &&
    !impact.isFetching &&
    space.version === impact.data.spaceVersion;
  const back = withdrawing ? returnToWithdrawal : onBack;
  const toSpaces = () => void navigate(paths.spaces, { replace: true });

  function complete() {
    allowNavigation(() => {
      void navigate(
        withdrawing ? `${paths.withdrawal}?cleanup=deleted` : paths.spaces,
        {
          replace: true,
          state: { familyAction: { kind: "deleted", spaceId } },
        },
      );
      endFamilyAccess(client, session.accountId, spaceId);
    });
  }
  function reload() {
    if (deletion.pending || deletion.uncertain) return;
    deletion.reset();
    void Promise.all([management.refresh(), impact.refetch()]);
  }
  function remove() {
    if (!ready || !impact.data || deletion.error) return;
    deletion.submit(
      {
        expectedSpaceVersion: impact.data.spaceVersion,
        impactToken: impact.data.impactToken,
        clientRequestId: crypto.randomUUID(),
      },
      complete,
    );
  }
  const forbidden = !!space && space.role !== "OWNER";
  return (
    <FamilyPageLayout
      title="공간 삭제"
      spaceId={spaceId}
      onBack={back}
      actions={
        !denied &&
        !forbidden &&
        !deletion.result && (
          <>
            {deletion.uncertain ? (
              <Button
                variant="destructive"
                loading={deletion.pending}
                onClick={() => deletion.retry(complete)}
              >
                같은 삭제 요청으로 결과 확인
              </Button>
            ) : deletion.error ? (
              <Button onClick={reload}>현재 삭제 영향 다시 확인</Button>
            ) : (
              <Button
                variant="destructive"
                loading={deletion.pending}
                disabled={!ready}
                onClick={remove}
              >
                공간과 모든 기록 삭제
              </Button>
            )}
            <TextAction
              disabled={deletion.pending}
              onClick={back}
            >
              {deletion.uncertain ? "결과 확인 나가기" : "취소"}
            </TextAction>
          </>
        )
      }
    >
      {denied ? (
        <ErrorState
          reason="no-permission"
          title="이 공간의 삭제 결과를 확인할 수 없어요"
          body="공간이 삭제됐거나 접근 권한이 변경됐을 수 있어요. 삭제 완료로 확정할 수 없으니 현재 참여 중인 공간을 확인해 주세요."
          actionLabel={withdrawing ? "탈퇴 절차로 돌아가기" : "참여 공간 선택"}
          onAction={withdrawing ? returnToWithdrawal : toSpaces}
        />
      ) : forbidden ? (
        <ErrorState
          reason="no-permission"
          title="소유자만 공간을 삭제할 수 있어요"
          actionLabel={withdrawing ? "탈퇴 절차로 돌아가기" : "참여 공간 선택"}
          onAction={withdrawing ? returnToWithdrawal : toSpaces}
        />
      ) : deletion.pending || deletion.uncertain || deletion.result ? (
        <Notice
          role={deletion.uncertain ? "alert" : "status"}
          tone={deletion.uncertain ? "error" : "info"}
          title={
            deletion.uncertain
              ? "삭제 결과가 아직 확인되지 않았어요"
              : "삭제 결과를 확인하고 있어요"
          }
          body="요청이 처리됐을 수 있어요. 이 화면을 나가도 이미 시작된 삭제는 취소되지 않아요."
        />
      ) : !space || !impact.data || management.error || impact.error ? (
        management.error || impact.error ? (
          <ErrorState
            reason="load-error"
            title="삭제 영향을 불러오지 못했어요"
            onAction={reload}
          />
        ) : (
          <LoadingState label="공간의 삭제 영향을 확인하고 있어요" />
        )
      ) : (
        <>
          <h1 className="text-hm-title-page">
            {space.subjectLabel}의 돌봄 공간을
            <br />
            삭제할까요?
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            이 공간을 함께 쓰는 모든 가족에게 적용돼요.
          </p>
          <Notice
            tone="error"
            title="삭제하면 복구할 수 없어요"
            body="삭제한 공간과 기록은 되돌릴 수 없어요."
          />
          <FamilyInfoCard title="함께 삭제되는 정보">
            <ul className="flex flex-col gap-hm-8">
              <li>참여 이력 {impact.data.counts.members}건</li>
              <li>소식 원본 {impact.data.counts.records}건</li>
              <li>돌봄 항목 {impact.data.counts.items}건</li>
              <li>제안 {impact.data.counts.proposals}건</li>
              <li>변경 요청 {impact.data.counts.requests}건</li>
              <li>변경 이력 {impact.data.counts.historyEntries}건</li>
            </ul>
            <p className="mt-hm-12 text-hm-body-small text-hm-text-secondary">
              종료된 참여와 삭제·무효 상태의 자료를 포함한 전체 건수예요. 연결된
              근거와 표시 내용도 함께 삭제돼요.
            </p>
          </FamilyInfoCard>
          <FamilyInfoCard title="가족의 접근">
            모든 가족이 이 공간에 접근할 수 없게 돼요.
          </FamilyInfoCard>
          <FamilyInfoCard title="기존 링크">
            이 공간의 초대·공유 링크도 사용할 수 없어요.
          </FamilyInfoCard>
          {space.version !== impact.data.spaceVersion && (
            <Notice
              title="공간 정보가 변경됐어요"
              body="최신 삭제 영향을 다시 확인하고 결정해 주세요."
            />
          )}
          {deletion.error && (
            <Notice
              tone="error"
              role="alert"
              title="공간을 삭제하지 못했어요"
              body={familyActionFailure(deletion.error)}
            />
          )}
          <TextAction
            disabled={management.refreshing || impact.isFetching}
            onClick={reload}
          >
            최신 삭제 영향 확인
          </TextAction>
          <Button
            variant="outline"
            onClick={() =>
              void navigate(withReturn(familyTransferPath(spaceId)))
            }
          >
            기록을 남기고 소유권 이전하기
          </Button>
        </>
      )}
      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        title="삭제 결과 확인을 나갈까요?"
        body="이미 시작된 삭제는 취소되지 않아요. 이 화면을 나가면 같은 요청으로 결과를 확인할 수 없어요."
        confirmLabel="확인 종료"
        cancelLabel="계속 확인"
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />
    </FamilyPageLayout>
  );
}
