import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { Badge, Button, Comparison, TextAction } from "@/components/ui";
import { useSession } from "@/features/auth/model/useSession";
import { transferSpaceOwnership } from "@/features/carespace/api/familyManagementApi";
import type {
  TransferSpaceOwnershipBody,
  TransferSpaceOwnershipResult,
} from "@/features/carespace/api/familyManagementTypes";
import { familyActionFailure } from "@/features/carespace/model/familyActionFailure";
import { refreshFamilyData } from "@/features/carespace/model/familyCache";
import { useFamilyAction } from "@/features/carespace/model/useFamilyAction";
import { useFamilyManagement } from "@/features/carespace/model/useFamilyManagement";
import { FamilyInfoCard } from "@/features/carespace/ui/FamilyInfoCard";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ApiError } from "@/lib/api";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import {
  familyLeavePath,
  familyTransferPath,
  paths,
  spacePath,
} from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function ConnectedFamilyTransferConfirmPage() {
  const { careSpaceId, memberId } = useParams();
  return <TransferConfirmation key={`${careSpaceId}:${memberId}`} />;
}

function TransferConfirmation() {
  const data = useFamilyManagement();
  const { space, members, spaceId } = data;
  const { memberId = "" } = useParams();
  const session = useSession();
  const client = useQueryClient();
  const navigate = useAppNavigate();
  const { withReturn, withdrawing, returnToWithdrawal } = useWithdrawalReturn();
  const onBack = useBackNavigation(withReturn(familyTransferPath(spaceId)));
  const action = useFamilyAction<
    TransferSpaceOwnershipBody,
    TransferSpaceOwnershipResult
  >((body) => transferSpaceOwnership(spaceId, body));
  const { blocker } = useUnsavedChanges(action.pending || action.uncertain);
  const member = members?.find((entry) => entry.membershipId === memberId);
  const self = members?.find((entry) => entry.isMe);
  const owner = members?.find((entry) => entry.role === "OWNER");
  const denied =
    data.error instanceof ApiError &&
    [403, 404].includes(data.error.status ?? 0);
  const loaded = !!space && !!members;
  const missing =
    loaded && (!member || member.isMe || member.role !== "MEMBER");
  const forbidden = denied || (loaded && space.role !== "OWNER");
  const ready =
    loaded && !forbidden && !missing && !data.error && !data.refreshing;
  const completed = !!action.result;
  // 성공 재전송은 과거 결과일 수 있으므로 현재 역할은 재조회한 상세로만 표시한다.
  const currentKnown =
    completed &&
    loaded &&
    !data.error &&
    !data.refreshing &&
    BigInt(space.version) >= BigInt(action.result!.spaceVersion);
  const toFamily = () =>
    void navigate(withReturn(spacePath(spaceId, "family")), {
      replace: true,
      motion: "back",
    });
  const recover = withdrawing ? returnToWithdrawal : toFamily;
  const recoveryLabel = withdrawing ? "탈퇴 절차로 돌아가기" : "가족 화면으로";
  const refresh = () => {
    if (action.pending || action.uncertain) return;
    action.reset();
    void data.refresh();
  };
  const complete = () => refreshFamilyData(client, session.accountId, spaceId);
  const submit = () => {
    if (action.pending) return;
    if (action.uncertain) {
      action.retry(complete);
      return;
    }
    if (!ready || !space) return;
    action.submit(
      {
        expectedSpaceVersion: space.version,
        targetMembershipId: memberId,
        clientRequestId: crypto.randomUUID(),
      },
      complete,
    );
  };
  return (
    <FamilyPageLayout
      title={completed ? "소유권 이전 완료" : "소유권 이전 확인"}
      spaceId={spaceId}
      onBack={completed ? recover : onBack}
      tabs={completed && currentKnown && !withdrawing}
      actions={
        completed ? (
          <>
            <Button onClick={recover}>
              {withdrawing ? "남은 소유 공간 확인" : "가족 화면으로"}
            </Button>
            {withdrawing ? (
              <TextAction
                onClick={() => void navigate(paths.account, { replace: true })}
              >
                탈퇴 취소
              </TextAction>
            ) : currentKnown && space.role === "MEMBER" ? (
              <TextAction
                onClick={() =>
                  void navigate(familyLeavePath(spaceId), { replace: true })
                }
              >
                이어서 공간 나가기
              </TextAction>
            ) : null}
          </>
        ) : action.pending ? (
          <Button
            loading
            disabled
          >
            이전 결과 확인 중
          </Button>
        ) : action.uncertain ? (
          <>
            <Button
              loading={action.pending}
              onClick={submit}
            >
              같은 이전 요청으로 결과 확인
            </Button>
            <TextAction
              disabled={action.pending}
              onClick={recover}
            >
              {recoveryLabel}
            </TextAction>
          </>
        ) : action.error ? (
          <>
            <Button
              disabled={data.refreshing}
              onClick={refresh}
            >
              현재 가족 정보 다시 확인
            </Button>
            <TextAction onClick={recover}>{recoveryLabel}</TextAction>
          </>
        ) : loaded && !forbidden ? (
          missing ? (
            <>
              <Button
                onClick={() =>
                  void navigate(withReturn(familyTransferPath(spaceId)), {
                    replace: true,
                  })
                }
              >
                가족 다시 선택
              </Button>
              <TextAction onClick={recover}>{recoveryLabel}</TextAction>
            </>
          ) : (
            <>
              <Button
                disabled={!ready}
                loading={action.pending}
                onClick={submit}
              >
                {member?.displayName ?? "선택한 가족"}님에게 소유권 이전
              </Button>
              <TextAction
                disabled={action.pending}
                onClick={onBack}
              >
                취소
              </TextAction>
            </>
          )
        ) : undefined
      }
    >
      {completed ? (
        <>
          <Badge
            className="self-start"
            tone="brand"
            label="이전 완료"
          />
          <h1 className="text-hm-title-page">
            소유자 역할을
            <br />
            넘겼어요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            소식과 돌봄 기록은 그대로예요.
          </p>
          {currentKnown ? (
            <>
              {owner && (
                <FamilyMember
                  name={owner.displayName ?? "이름 미등록"}
                  role="owner"
                  self={owner.isMe}
                  detail="현재 소유자"
                />
              )}
              {self && self.membershipId !== owner?.membershipId && (
                <FamilyMember
                  name={self.displayName ?? "이름 미등록"}
                  role={self.role === "OWNER" ? "owner" : "member"}
                  self
                  detail="나 · 현재 공간에 참여 중"
                />
              )}
              <Notice
                title={
                  withdrawing
                    ? "회원 탈퇴는 아직 하지 않았어요"
                    : "현재 가족 정보를 확인했어요"
                }
                body={
                  withdrawing
                    ? "남은 소유 공간을 확인한 뒤 탈퇴 절차를 이어가 주세요."
                    : "현재 역할과 가족 목록이에요. 나가려면 참여 종료 내용을 한 번 더 확인해 주세요."
                }
              />
            </>
          ) : data.refreshing ? (
            <LoadingState label="이전 후 현재 역할을 확인하고 있어요" />
          ) : (
            <Notice
              tone="error"
              title="현재 가족 정보를 다시 확인해 주세요"
              body="이전 요청은 완료됐어요. 현재 역할과 참여 상태는 최신 정보를 불러온 뒤 확인할 수 있어요."
              action={{
                label: "최신 정보 확인",
                onClick: () => void data.refresh(),
              }}
            />
          )}
        </>
      ) : action.pending ? (
        <LoadingState label="소유권 이전 결과를 확인하고 있어요" />
      ) : action.error ? (
        <>
          <h1 className="text-hm-title-page">
            {action.uncertain
              ? "이전 결과를 확인해 주세요"
              : "소유권을 이전하지 못했어요"}
          </h1>
          <Notice
            role="alert"
            tone="error"
            title={
              action.uncertain
                ? "요청이 처리됐을 수 있어요"
                : "현재 내용을 다시 확인해 주세요"
            }
            body={
              action.uncertain
                ? "같은 이전 요청으로 다시 확인해 주세요. 새로운 이전 요청은 보내지 않아요."
                : familyActionFailure(action.error)
            }
          />
        </>
      ) : denied ? (
        <ErrorState
          reason="no-permission"
          title="이 공간에 접근할 수 없어요"
          actionLabel={withdrawing ? "탈퇴 절차로 돌아가기" : "참여 공간 선택"}
          onAction={
            withdrawing ? returnToWithdrawal : () => void navigate(paths.spaces)
          }
        />
      ) : !loaded ? (
        <ReviewQueryState
          error={data.error}
          retry={() => void data.refresh()}
        />
      ) : forbidden ? (
        <ErrorState
          reason="no-permission"
          title="현재 소유자만 역할을 이전할 수 있어요"
          actionLabel={recoveryLabel}
          onAction={recover}
        />
      ) : missing ? (
        <>
          <h1 className="text-hm-title-page">
            다른 가족을
            <br />
            선택해 주세요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            선택한 가족은 현재 이전할 수 있는 구성원이 아니에요.
          </p>
          <Notice
            title="소유권을 이전하지 않았어요"
            body="현재 함께하는 가족 목록을 다시 확인해 주세요."
          />
        </>
      ) : (
        <>
          {data.error && (
            <Notice
              role="alert"
              tone="error"
              title="최신 가족 정보를 확인하지 못했어요"
              body="이전하기 전에 현재 내용을 다시 확인해 주세요."
              action={{
                label: "다시 확인",
                onClick: () => void data.refresh(),
              }}
            />
          )}
          <h1 className="text-hm-title-page">
            소유자 역할을
            <br />
            {member?.displayName ?? "선택한 가족"}님께 넘길까요?
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {space.subjectLabel}의 돌봄
          </p>
          <FamilyInfoCard title="소유자">
            <Comparison
              beforeLabel="현재"
              beforeValue={`${self?.displayName ?? "나"} · 나`}
              afterLabel="변경 후"
              afterValue={member?.displayName ?? "이름 미등록"}
            />
          </FamilyInfoCard>
          <FamilyInfoCard title={`${self?.displayName ?? "나"} · 나`}>
            구성원으로 바뀌어요.
            <br />
            승인이 필요한 변경은 새 소유자에게 요청해요.
          </FamilyInfoCard>
          <FamilyInfoCard title="남는 정보">
            소식·돌봄 항목·이력과 현재 담당 할 일은 유지돼요.
          </FamilyInfoCard>
          <Notice
            title="이전해도 공간에 남아 있어요"
            body="공간에서 나가려면 이전이 끝난 뒤 ‘공간 나가기’를 진행해 주세요."
          />
        </>
      )}
      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        title="이전 결과 확인을 나갈까요?"
        body="처리 중인 이전은 취소되지 않아요. 이 화면을 나가면 같은 요청으로 결과를 확인할 수 없어요."
        confirmLabel="확인 종료"
        cancelLabel="계속 확인"
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />
    </FamilyPageLayout>
  );
}
