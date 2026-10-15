import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { ErrorState, Notice } from "@/components/feedback";
import { Button, TextAction } from "@/components/ui";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import { FamilyDepartureImpact } from "@/features/carespace/ui/FamilyDepartureImpact";
import { unfinishedMemberTasks } from "@/features/carespace/model/familySelectors";
import { mockFamilyActions } from "@/features/carespace/model/mockFamilyActions";
import { familyActionStates } from "@/features/carespace/model/familyScreenStates";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { useMockAction } from "@/lib/useMockAction";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import { familyMembersPath, spacePath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";

export function FamilyRemovePage() {
  const space = useOutletContext<CareSpaceView>();
  const { memberId = "" } = useParams();
  const { items } = useMockProposals(space);
  const navigate = useNavigate();
  const onBack = useBackNavigation(familyMembersPath(space.id));
  const [state, setState] = useMockScreenState(familyActionStates, "default");
  const { pending, run } = useMockAction();
  const [error, setError] = useState("");
  const member = space.members.find((entry) => entry.id === memberId);
  const forbidden =
    space.role !== "owner" ||
    state === "forbidden" ||
    member?.self ||
    member?.role === "owner";
  const missing = !member || state === "missing";
  function submit() {
    setError("");
    run(() => {
      if (state === "error") {
        setError(
          "참여를 종료하지 못했어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
        );
        setState("default");
        return;
      }
      const result = mockFamilyActions.removeMember(space.id, memberId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      void navigate(spacePath(space.id, "family"), {
        replace: true,
        state: { familyRemoval: result },
      });
    });
  }
  return (
    <FamilyPageLayout
      title="참여 관리"
      spaceId={space.id}
      onBack={onBack}
      preview={{
        value: state,
        options: familyActionStates,
        onChange: (value) => {
          if (!pending) {
            setError("");
            setState(value);
          }
        },
      }}
      actions={
        !forbidden &&
        !missing && (
          <>
            <Button
              variant="destructive"
              loading={pending}
              onClick={submit}
            >
              {member.name}님 내보내기
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
      {forbidden ? (
        <ErrorState
          reason="no-permission"
          title="소유자만 구성원을 내보낼 수 있어요"
          actionLabel="가족 화면으로"
          onAction={() => void navigate(spacePath(space.id, "family"))}
        />
      ) : missing ? (
        <>
          <h1 className="text-hm-title-page">
            이미 참여가
            <br />
            종료된 가족이에요
          </h1>
          <Notice
            title="현재 가족 목록을 확인해 주세요"
            body="새로 불러온 목록에서 함께하는 가족을 확인할 수 있어요."
          />
          <Button
            onClick={() =>
              void navigate(familyMembersPath(space.id), { replace: true })
            }
          >
            가족 목록 새로고침
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-hm-title-page">
            {member.name}님을 이 공간에서
            <br />
            내보낼까요?
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {careSpaceName(space)}에서 참여가 종료돼요.
          </p>
          <FamilyMember
            {...member}
            detail="현재 구성원"
          />
          <FamilyDepartureImpact
            tasks={unfinishedMemberTasks(items, memberId)}
          />
          {error && (
            <Notice
              role="alert"
              tone="error"
              title="내보내기를 완료하지 못했어요"
              body={error}
            />
          )}
        </>
      )}
    </FamilyPageLayout>
  );
}
