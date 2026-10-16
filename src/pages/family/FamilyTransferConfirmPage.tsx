import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { ErrorState, Notice } from "@/components/feedback";
import { Badge, Button, Comparison, TextAction } from "@/components/ui";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import { familyActionStates } from "@/features/carespace/model/familyScreenStates";
import { mockFamilyActions } from "@/features/carespace/model/mockFamilyActions";
import { FamilyInfoCard } from "@/features/carespace/ui/FamilyInfoCard";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import { useMockAction } from "@/lib/useMockAction";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import {
  familyLeavePath,
  familyTransferPath,
  spacePath,
  paths,
} from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function FamilyTransferConfirmPage() {
  const space = useOutletContext<CareSpaceView>();
  const { memberId = "" } = useParams();
  const navigate = useNavigate();
  const { withReturn, withdrawing, returnToWithdrawal } = useWithdrawalReturn();
  const onBack = useBackNavigation(withReturn(familyTransferPath(space.id)));
  const [state, setState] = useMockScreenState(familyActionStates, "default");
  const { pending, run } = useMockAction();
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const member = space.members.find((entry) => entry.id === memberId);
  const self = space.members.find((entry) => entry.self)!;
  const missing = !member || state === "missing";
  const forbidden =
    space.role !== "owner" || state === "forbidden" || member?.self;
  const toFamily = () =>
    void navigate(spacePath(space.id, "family"), { replace: true });
  const recover = withdrawing ? returnToWithdrawal : toFamily;
  const recoveryLabel = withdrawing ? "탈퇴 절차로 돌아가기" : "가족 화면으로";
  const comparison = (
    <Comparison
      beforeLabel="현재"
      beforeValue={`${self.name} · 나`}
      afterLabel="변경 후"
      afterValue={member?.name ?? "참여가 종료된 가족"}
    />
  );
  function submit() {
    setError("");
    run(() => {
      if (state === "error") {
        setError("연결 상태를 확인한 뒤 다시 시도해 주세요.");
        setState("default");
        return;
      }
      const result = mockFamilyActions.transfer(space.id, memberId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setCompleted(true);
    });
  }
  return (
    <FamilyPageLayout
      title={completed ? "소유권 이전 완료" : "소유권 이전 확인"}
      spaceId={space.id}
      onBack={
        completed ? (withdrawing ? returnToWithdrawal : toFamily) : onBack
      }
      tabs={completed && !withdrawing}
      preview={
        completed
          ? undefined
          : {
              value: state,
              options: familyActionStates,
              onChange: (value) => {
                if (!pending) {
                  setError("");
                  setState(value);
                }
              },
            }
      }
      actions={
        completed ? (
          <>
            <Button onClick={withdrawing ? returnToWithdrawal : toFamily}>
              {withdrawing ? "남은 소유 공간 확인" : "가족 화면으로"}
            </Button>
            <TextAction
              onClick={() =>
                withdrawing
                  ? void navigate(paths.account, { replace: true })
                  : void navigate(familyLeavePath(space.id), { replace: true })
              }
            >
              {withdrawing ? "탈퇴 취소" : "이어서 공간 나가기"}
            </TextAction>
          </>
        ) : (
          !forbidden &&
          (missing ? (
            <>
              <Button
                onClick={() =>
                  void navigate(withReturn(familyTransferPath(space.id)), {
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
                loading={pending}
                onClick={submit}
              >
                {error ? "다시 시도" : `${member.name}님에게 소유권 이전`}
              </Button>
              <TextAction
                disabled={pending}
                onClick={error ? recover : onBack}
              >
                {error ? recoveryLabel : "취소"}
              </TextAction>
            </>
          ))
        )
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
          {member && (
            <FamilyMember
              {...member}
              detail="새 소유자"
            />
          )}
          <FamilyMember
            {...self}
            name={`${self.name} · 나`}
            initial={self.name[0]}
            detail="나 · 현재 공간에 참여 중"
          />
          <Notice
            title={
              withdrawing
                ? "회원 탈퇴는 아직 하지 않았어요"
                : "지금도 함께하는 가족이에요"
            }
            body={
              withdrawing
                ? "남은 소유 공간을 확인한 뒤 탈퇴 절차를 이어가 주세요."
                : "나가려면 참여 종료 내용을 한 번 더 확인해 주세요."
            }
          />
        </>
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
            선택한 가족은 지금 이 공간에 참여하고 있지 않아요.
          </p>
          <Notice
            title="소유권을 이전하지 않았어요"
            body="현재 함께하는 가족 목록을 다시 확인해 주세요."
          />
        </>
      ) : error ? (
        <>
          <h1 className="text-hm-title-page">
            소유권을
            <br />
            이전하지 못했어요
          </h1>
          <p
            role="alert"
            className="text-hm-body-default text-hm-text-secondary"
          >
            {error}
          </p>
          <FamilyInfoCard title="이전하려던 내용">{comparison}</FamilyInfoCard>
          <Notice
            title="선택한 가족은 그대로예요"
            body="다시 시도하기 전에 지금 함께하는 가족인지 확인해요."
          />
        </>
      ) : (
        <>
          <h1 className="text-hm-title-page">
            소유자 역할을
            <br />
            {member.name}님께 넘길까요?
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {careSpaceName(space)}
          </p>
          <FamilyInfoCard title="소유자">{comparison}</FamilyInfoCard>
          <FamilyInfoCard title={`${self.name} · 나`}>
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
    </FamilyPageLayout>
  );
}
