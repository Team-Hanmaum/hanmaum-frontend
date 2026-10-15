import { useNavigate, useOutletContext } from "react-router";
import { ErrorState, Notice } from "@/components/feedback";
import { Button, MenuRow, TextAction } from "@/components/ui";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import { FamilyDepartureImpact } from "@/features/carespace/ui/FamilyDepartureImpact";
import { unfinishedMemberTasks } from "@/features/carespace/model/familySelectors";
import {
  useFamilyExit,
  familyExitStates,
} from "@/features/carespace/model/useFamilyExit";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import {
  familyDeletePath,
  familyTransferPath,
  paths,
  spacePath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";

export function FamilyLeavePage() {
  const space = useOutletContext<CareSpaceView>();
  const { items } = useMockProposals(space);
  const navigate = useNavigate();
  const onBack = useBackNavigation(spacePath(space.id, "family"));
  const [state, setState] = useMockScreenState(familyExitStates, "default");
  const { pending, error, submit, clearError } = useFamilyExit(
    space.id,
    "leave",
    (noticeId) =>
      void navigate(paths.spaces, {
        replace: true,
        state: { familyExit: noticeId },
      }),
  );
  const self = space.members.find((member) => member.self)!;
  const owner = space.role === "owner";
  return (
    <FamilyPageLayout
      title="공간 나가기"
      spaceId={space.id}
      onBack={onBack}
      preview={{
        value: state,
        options: familyExitStates,
        onChange: (value) => {
          if (!pending) {
            clearError();
            setState(value);
          }
        },
      }}
      actions={
        state !== "forbidden" && (
          <>
            <Button
              variant={owner ? "primary" : "destructive"}
              loading={pending}
              onClick={() =>
                owner
                  ? void navigate(familyTransferPath(space.id))
                  : submit(state === "error", () => setState("default"))
              }
            >
              {owner ? "소유권 이전하기" : "공간 나가기"}
            </Button>
            <TextAction
              disabled={pending}
              onClick={onBack}
            >
              취소
            </TextAction>
          </>
        )
      }
    >
      {state === "forbidden" ? (
        <ErrorState
          reason="no-permission"
          onAction={() => void navigate(paths.spaces)}
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
            {...self}
            name={`${self.name} · 나`}
            initial={self.name[0]}
            detail="현재 소유자"
          />
          <Notice
            title="가족의 기록을 이어갈 수 있어요"
            body="소유권을 넘긴 뒤 구성원으로 바뀌면 공간에서 나갈 수 있어요."
          />
          <MenuRow
            icon="alert-error"
            tone="danger"
            title="공간과 기록을 모두 삭제하기"
            description="모든 가족의 접근과 기록이 함께 종료돼요."
            onClick={() => void navigate(familyDeletePath(space.id))}
          />
        </>
      ) : (
        <>
          <h1 className="text-hm-title-page">
            {careSpaceName(space)}에서
            <br />
            나갈까요?
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {self.name} · 현재 구성원
          </p>
          <FamilyDepartureImpact
            tasks={unfinishedMemberTasks(items, self.id)}
            self
          />
          <Notice
            title="나가기는 기록 삭제와 달라요"
            body="기록을 지우는 작업은 소식 삭제 등 별도 절차에서 진행해요."
          />
          {error && (
            <Notice
              tone="error"
              role="alert"
              title="나가기를 완료하지 못했어요"
              body={error}
            />
          )}
        </>
      )}
    </FamilyPageLayout>
  );
}
