import { useQueryClient } from "@tanstack/react-query";
import { ErrorState, Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { Button, MenuRow, TextAction } from "@/components/ui";
import { useSession } from "@/features/auth/model/useSession";
import { useCareItems } from "@/features/careitem/model/useCareQueries";
import { leaveCareSpace } from "@/features/carespace/api/familyManagementApi";
import type { MembershipChangeBody } from "@/features/carespace/api/familyManagementTypes";
import { endFamilyAccess } from "@/features/carespace/model/familyCache";
import { useFamilyAction } from "@/features/carespace/model/useFamilyAction";
import { useFamilyManagement } from "@/features/carespace/model/useFamilyManagement";
import { FamilyDepartureImpact } from "@/features/carespace/ui/FamilyDepartureImpact";
import { FamilyActionNotice } from "@/features/carespace/ui/FamilyActionNotice";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import {
  familyDeletePath,
  familyTransferPath,
  paths,
  spacePath,
} from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function FamilyLeavePage() {
  const data = useFamilyManagement();
  const { spaceId, space, members } = data;
  const tasks = useCareItems(spaceId, "TASK");
  const session = useSession();
  const client = useQueryClient();
  const navigate = useAppNavigate();
  const { withReturn, withdrawing, returnToWithdrawal } = useWithdrawalReturn();
  const onBack = useBackNavigation(withReturn(spacePath(spaceId, "family")));
  const back = withdrawing ? returnToWithdrawal : onBack;
  const action = useFamilyAction((body: MembershipChangeBody) =>
    leaveCareSpace(spaceId, body),
  );
  const { blocker, allowNavigation } = useUnsavedChanges(
    action.pending || action.uncertain,
  );
  const self = members?.find((member) => member.isMe);
  const owner = space?.role === "OWNER";
  const ready =
    !!space &&
    !!self &&
    !owner &&
    !!tasks.data &&
    !tasks.error &&
    !tasks.isFetching &&
    !data.error &&
    !data.refreshing &&
    !action.error;
  const complete = () =>
    allowNavigation(() => {
      // 성공 재전송 뒤 재참여했을 수도 있으므로 현재 목록을 서버에서 다시 읽는다.
      void navigate(withdrawing ? paths.withdrawal : paths.spaces, {
        replace: true,
        state: { familyAction: { kind: "left", spaceId } },
      });
      endFamilyAccess(client, session.accountId, spaceId);
    });
  const reload = () => {
    if (action.pending || action.uncertain) return;
    action.reset();
    void data.refresh();
    void tasks.refetch();
  };
  return (
    <FamilyPageLayout
      title="공간 나가기"
      spaceId={spaceId}
      onBack={back}
      actions={
        <>
          {action.uncertain ? (
            <Button
              loading={action.pending}
              onClick={() => action.retry(complete)}
            >
              같은 나가기 요청으로 결과 확인
            </Button>
          ) : action.error ? (
            <Button
              disabled={action.pending || data.refreshing}
              onClick={reload}
            >
              현재 참여 상태 다시 확인
            </Button>
          ) : owner ? (
            <Button
              disabled={!!data.error || data.refreshing}
              onClick={() =>
                void navigate(withReturn(familyTransferPath(spaceId)))
              }
            >
              소유권 이전하기
            </Button>
          ) : space && self ? (
            <Button
              variant="destructive"
              loading={action.pending}
              disabled={!ready}
              onClick={() => {
                if (ready)
                  action.submit(
                    {
                      expectedSpaceVersion: space.version,
                      clientRequestId: crypto.randomUUID(),
                    },
                    complete,
                  );
              }}
            >
              공간 나가기
            </Button>
          ) : null}
          <TextAction
            disabled={action.pending}
            onClick={back}
          >
            {action.uncertain ? "결과 확인 나가기" : "취소"}
          </TextAction>
        </>
      }
    >
      <FamilyActionNotice
        error={action.error}
        uncertain={action.uncertain}
      />
      {action.pending || action.uncertain ? (
        <Notice
          title="나가기 결과 확인 중"
          body="이미 시작된 참여 종료는 이 화면을 나가도 취소되지 않아요."
        />
      ) : !space || !members ? (
        <>
          <ReviewQueryState
            error={data.error}
            retry={() => void data.refresh()}
          />
          <Button onClick={() => void navigate(paths.spaces)}>
            참여 공간 선택
          </Button>
        </>
      ) : !self ? (
        <ErrorState
          reason="no-permission"
          title="현재 참여 정보를 확인해 주세요"
          actionLabel="다시 확인"
          onAction={reload}
        />
      ) : owner ? (
        <>
          <h1 className="text-hm-title-page">
            먼저 소유자 역할을
            <br />
            넘겨 주세요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            가족의 기록을 남기려면 다른 가족에게 소유권을 이전해 주세요.
          </p>
          <FamilyMember
            name={self.displayName || "이름 미등록"}
            role="owner"
            self
            detail="현재 소유자"
          />
          <Notice
            title="가족의 기록을 이어갈 수 있어요"
            body="소유권을 넘긴 뒤 구성원으로 바뀌면 공간에서 나갈 수 있어요."
          />
          {data.error && (
            <ReviewQueryState
              error={data.error}
              retry={reload}
            />
          )}
          <MenuRow
            icon="alert-error"
            tone="danger"
            title="공간과 기록을 모두 삭제하기"
            description="모든 가족의 접근과 기록이 함께 종료돼요."
            onClick={() => void navigate(withReturn(familyDeletePath(spaceId)))}
          />
        </>
      ) : (
        <>
          <h1 className="text-hm-title-page">
            {space.subjectLabel}의 돌봄에서
            <br />
            나갈까요?
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {self.displayName || "나"} · 현재 구성원
          </p>
          {data.error && (
            <ReviewQueryState
              error={data.error}
              retry={reload}
            />
          )}
          {tasks.data && !tasks.error ? (
            <FamilyDepartureImpact
              data={tasks.data}
              membershipId={self.membershipId}
              self
            />
          ) : (
            <ReviewQueryState
              error={tasks.error}
              retry={() => void tasks.refetch()}
            />
          )}
          <Notice
            title="나가기는 기록 삭제와 달라요"
            body="기록을 지우는 작업은 소식 삭제 등 별도 절차에서 진행해요."
          />
        </>
      )}
      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        title="나가기 결과 확인을 나갈까요?"
        body="이미 보낸 요청은 취소되지 않아요. 나가면 참여 공간 목록에서 현재 참여 상태를 확인해 주세요."
        confirmLabel="확인 종료"
        cancelLabel="계속 확인"
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />
    </FamilyPageLayout>
  );
}
