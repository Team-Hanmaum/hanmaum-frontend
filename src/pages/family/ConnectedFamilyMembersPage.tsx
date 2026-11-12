import { Button, MenuRow } from "@/components/ui";
import { ErrorState, Notice } from "@/components/feedback";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import { useFamilyManagement } from "@/features/carespace/model/useFamilyManagement";
import { unfinishedFamilyTasks } from "@/features/carespace/model/familyTasks";
import { useCareItems } from "@/features/careitem/model/useCareQueries";
import { toSpaceView } from "@/features/dashboard/model/homeData";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import {
  familyRemovePath,
  familyTransferPath,
  paths,
  spacePath,
} from "@/routes/paths";

export function ConnectedFamilyMembersPage() {
  const data = useFamilyManagement();
  const tasks = useCareItems(data.spaceId, "TASK");
  const navigate = useAppNavigate();
  const { withReturn, withdrawing, returnToWithdrawal } = useWithdrawalReturn();
  const back = () =>
    void navigate(withReturn(spacePath(data.spaceId, "family")), {
      motion: "back",
    });
  const view =
    data.space && data.members
      ? toSpaceView(data.space, data.members)
      : undefined;
  return (
    <FamilyPageLayout
      connected
      title="구성원 관리"
      spaceId={data.spaceId}
      onBack={withdrawing ? returnToWithdrawal : back}
      tabs={!withdrawing}
    >
      {!view ? (
        <ReviewQueryState
          error={data.error}
          retry={() => void data.refresh()}
        />
      ) : view.role !== "owner" ? (
        <ErrorState
          reason="no-permission"
          title="소유자만 참여를 관리할 수 있어요"
          actionLabel="가족 화면으로"
          onAction={back}
        />
      ) : (
        <>
          <h1 className="text-hm-title-page">
            함께하는 가족의
            <br />
            참여를 관리해요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {view.subjectLabel}의 돌봄 · {view.members.length}명
          </p>
          {(data.error || tasks.error) && (
            <Notice
              tone="error"
              title="최신 정보를 불러오지 못했어요"
              body="참여 관리 전에 가족과 담당 할 일을 다시 확인해 주세요."
              action={{
                label: "다시 불러오기",
                onClick: () => {
                  void data.refresh();
                  void tasks.refetch();
                },
              }}
            />
          )}
          {view.members.map((member) => (
            <section
              key={member.id}
              className="overflow-hidden rounded-hm-14 bg-hm-bg-surface"
            >
              <FamilyMember
                {...member}
                name={`${member.name}${member.self ? " · 나" : ""}`}
                initial={member.name[0]}
                detail={
                  tasks.data && !tasks.error
                    ? `미완료 담당 할 일 ${unfinishedFamilyTasks(tasks.data, member.id).length}개`
                    : "담당 할 일 확인 중"
                }
              />
              {!member.self && member.role === "member" && (
                <div className="px-hm-16 pb-hm-16">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!!data.error || data.refreshing}
                    aria-label={`${member.name} 참여 관리`}
                    onClick={() =>
                      void navigate(
                        withReturn(familyRemovePath(data.spaceId, member.id)),
                      )
                    }
                  >
                    참여 관리
                  </Button>
                </div>
              )}
            </section>
          ))}
          <MenuRow
            icon="person"
            title="소유권 이전"
            description="다른 가족에게 소유자 역할을 넘겨요"
            onClick={() =>
              void navigate(withReturn(familyTransferPath(data.spaceId)))
            }
          />
        </>
      )}
      {!view && (
        <Button
          variant="outline"
          onClick={() => void navigate(paths.spaces)}
        >
          참여 공간 선택
        </Button>
      )}
    </FamilyPageLayout>
  );
}
