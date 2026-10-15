import { useLocation, useNavigate, useOutletContext } from "react-router";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
} from "@/components/feedback";
import { Button, MenuRow } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import {
  memberTaskLabel,
  unfinishedMemberTasks,
} from "@/features/carespace/model/familySelectors";
import { familyListStates } from "@/features/carespace/model/familyScreenStates";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { familyMembersPath, paths, spaceInvitePath } from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";

export function FamilyPage() {
  const space = useOutletContext<CareSpaceView>();
  const { items } = useMockProposals(space);
  const [state, setState] = useMockScreenState(familyListStates, "default");
  const navigate = useNavigate();
  const location = useLocation();
  const removal = (
    location.state as {
      familyRemoval?: { name: string; released: number };
    } | null
  )?.familyRemoval;
  return (
    <>
      {removal && (
        <Notice
          role="status"
          title={`${removal.name}님의 참여가 종료됐어요`}
          body={`미완료 담당 할 일 ${removal.released}개가 담당자 미지정으로 바뀌었어요.`}
        />
      )}
      <h1 className="text-hm-title-page">함께하는 가족</h1>
      {state === "loading" ? (
        <LoadingState label="가족 목록을 불러오고 있어요" />
      ) : state === "error" ? (
        <ErrorState
          reason="load-error"
          title="가족 목록을 불러오지 못했어요"
          onAction={() => setState("default")}
        />
      ) : state === "forbidden" ? (
        <ErrorState
          reason="no-permission"
          onAction={() => void navigate(paths.spaces)}
        />
      ) : (
        <>
          <p className="text-hm-body-default text-hm-text-secondary">
            {space.subjectLabel}를 함께 돌보는 {space.members.length}명
          </p>
          {[...space.members]
            .sort(
              (a, b) => Number(b.role === "owner") - Number(a.role === "owner"),
            )
            .map((member) => (
              <FamilyMember
                key={member.id}
                {...member}
                name={`${member.name}${member.self ? " · 나" : ""}`}
                initial={member.name[0]}
                detail={memberTaskLabel(
                  unfinishedMemberTasks(items, member.id).length,
                )}
              />
            ))}
          {space.members.length === 1 ? (
            <EmptyState
              icon="family-brand"
              title="함께할 가족을 초대해요"
              body={"돌봄 소식과 일정을\n가족과 한곳에서 확인해 보세요."}
              action={{
                label: "가족 초대하기",
                onClick: () => void navigate(spaceInvitePath(space.id)),
              }}
            />
          ) : (
            <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
              <h2 className="text-hm-heading-section">가족과 함께 돌봐요</h2>
              <p className="text-hm-body-default text-hm-text-secondary">
                초대 링크는 24시간 동안 유효해요. 소유자와 구성원 모두 초대할 수
                있어요.
              </p>
              <Button onClick={() => void navigate(spaceInvitePath(space.id))}>
                가족 초대하기
              </Button>
            </section>
          )}
          {space.role === "owner" && (
            <>
              <h2 className="text-hm-heading-section">가족 관리</h2>
              <MenuRow
                icon="family-brand"
                title="구성원 관리"
                description="가족의 참여 권한을 관리해요"
                onClick={() => void navigate(familyMembersPath(space.id))}
              />
            </>
          )}
          <Notice
            tone="neutral"
            title="함께하는 가족의 역할"
            body="모두 소식을 남기고 가족을 초대해요. 맡은 할 일의 상태는 직접 바꿔요. 소유자는 승인이 필요한 변경을 최종 반영해요."
          />
        </>
      )}
    </>
  );
}
