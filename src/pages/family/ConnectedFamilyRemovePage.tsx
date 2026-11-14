import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorState, Notice } from "@/components/feedback";
import { Button, TextAction } from "@/components/ui";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { useSession } from "@/features/auth/model/useSession";
import { removeSpaceMember } from "@/features/carespace/api/familyManagementApi";
import type { MembershipChangeBody } from "@/features/carespace/api/familyManagementTypes";
import { useFamilyAction } from "@/features/carespace/model/useFamilyAction";
import { useFamilyManagement } from "@/features/carespace/model/useFamilyManagement";
import { refreshFamilyData } from "@/features/carespace/model/familyCache";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import { FamilyActionNotice } from "@/features/carespace/ui/FamilyActionNotice";
import { ConnectedFamilyDepartureImpact } from "@/features/carespace/ui/ConnectedFamilyDepartureImpact";
import { useCareItems } from "@/features/careitem/model/useCareQueries";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { familyMembersPath, paths, spacePath } from "@/routes/paths";

export function ConnectedFamilyRemovePage() {
  const { careSpaceId, memberId } = useParams();
  return <RemoveConfirmation key={`${careSpaceId}:${memberId}`} />;
}

function RemoveConfirmation() {
  const data = useFamilyManagement();
  const { memberId = "" } = useParams();
  const tasks = useCareItems(data.spaceId, "TASK");
  const session = useSession();
  const client = useQueryClient();
  const navigate = useAppNavigate();
  const { withReturn, withdrawing, returnToWithdrawal } = useWithdrawalReturn();
  const action = useFamilyAction((body: MembershipChangeBody) =>
    removeSpaceMember(data.spaceId, memberId, body),
  );
  const { blocker, allowNavigation } = useUnsavedChanges(
    action.pending || action.uncertain,
  );
  const back = () =>
    void navigate(withReturn(familyMembersPath(data.spaceId)), {
      motion: "back",
    });
  const member = data.members?.find((entry) => entry.membershipId === memberId);
  const allowed =
    data.space?.role === "OWNER" && member?.role === "MEMBER" && !member.isMe;
  const ready =
    allowed &&
    !!tasks.data &&
    !tasks.error &&
    !tasks.isFetching &&
    !data.error &&
    !data.refreshing &&
    !action.error;
  const complete = () => {
    allowNavigation(
      () =>
        void navigate(withReturn(spacePath(data.spaceId, "family")), {
          replace: true,
          state: { familyAction: { kind: "removed", spaceId: data.spaceId } },
        }),
    );
    refreshFamilyData(client, session.accountId, data.spaceId);
  };
  const reload = () => {
    action.reset();
    void data.refresh();
    void tasks.refetch();
  };
  return (
    <FamilyPageLayout
      title="참여 관리"
      spaceId={data.spaceId}
      onBack={withdrawing ? returnToWithdrawal : back}
      actions={
        <>
          {action.uncertain ? (
            <Button
              loading={action.pending}
              onClick={() => action.retry(complete)}
            >
              같은 요청으로 결과 확인
            </Button>
          ) : (
            allowed && (
              <Button
                variant="destructive"
                loading={action.pending}
                disabled={!ready}
                onClick={() => {
                  if (ready)
                    action.submit(
                      {
                        expectedSpaceVersion: data.space!.version,
                        clientRequestId: crypto.randomUUID(),
                      },
                      complete,
                    );
                }}
              >
                {member?.displayName || "구성원"}님 내보내기
              </Button>
            )
          )}
          {action.error && !action.uncertain && (
            <Button
              disabled={action.pending || data.refreshing}
              onClick={reload}
            >
              현재 가족 다시 확인
            </Button>
          )}
          <TextAction
            disabled={action.pending}
            onClick={back}
          >
            취소
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
          title="참여 종료 결과 확인 중"
          body="다른 작업을 진행하기 전에 이번 요청의 결과를 확인해 주세요."
        />
      ) : !data.space || !data.members ? (
        <>
          <ReviewQueryState
            error={data.error}
            retry={() => void data.refresh()}
          />
          <Button onClick={() => void navigate(paths.spaces)}>
            참여 공간 선택
          </Button>
        </>
      ) : !member ? (
        <Notice
          title="이미 참여가 종료된 가족이에요"
          body="현재 가족 목록에서 함께하는 가족을 확인해 주세요."
          action={{ label: "가족 목록으로", onClick: back }}
        />
      ) : !allowed ? (
        <ErrorState
          reason="no-permission"
          title="소유자만 다른 구성원을 내보낼 수 있어요"
          actionLabel="가족 화면으로"
          onAction={() =>
            void navigate(withReturn(spacePath(data.spaceId, "family")))
          }
        />
      ) : (
        <>
          <h1 className="text-hm-title-page">
            {member.displayName || "구성원"}님을 이 공간에서
            <br />
            내보낼까요?
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {data.space.subjectLabel}의 돌봄에서 참여가 종료돼요.
          </p>
          <FamilyMember
            name={member.displayName || "이름 미설정"}
            role="member"
            detail="현재 구성원"
          />
          {data.error && (
            <ReviewQueryState
              error={data.error}
              retry={() => void data.refresh()}
            />
          )}
          {tasks.data && !tasks.error ? (
            <ConnectedFamilyDepartureImpact
              data={tasks.data}
              membershipId={memberId}
            />
          ) : (
            <ReviewQueryState
              error={tasks.error}
              retry={() => void tasks.refetch()}
            />
          )}
        </>
      )}
      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        title="처리 결과 확인을 나갈까요?"
        body="이미 보낸 요청은 취소되지 않아요. 나가면 현재 가족 목록에서 결과를 확인해 주세요."
        confirmLabel="확인 종료"
        cancelLabel="계속 확인"
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />
    </FamilyPageLayout>
  );
}
