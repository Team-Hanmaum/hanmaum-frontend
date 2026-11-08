import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { Button } from "@/components/ui";
import { FamilyMember } from "@/features/carespace/ui";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { toSpaceView } from "@/features/dashboard/model/homeData";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { spaceInvitePath } from "@/routes/paths";

export function ConnectedFamilyPage() {
  const { space } = useConnectedSpace();
  const members = useSpaceMembers(space.spaceId);
  const navigate = useAppNavigate();
  if (!members.data)
    return members.isError ? (
      <ErrorState
        reason="load-error"
        onAction={() => void members.refetch()}
      />
    ) : (
      <LoadingState label="함께 돌보는 가족을 확인하고 있어요" />
    );
  return (
    <>
      <h1 className="text-hm-title-page">
        함께 돌보는 가족 {members.data.length}명
      </h1>
      {toSpaceView(space, members.data).members.map((member) => (
        <FamilyMember
          key={member.id}
          name={member.name}
          role={member.role}
          self={member.self}
        />
      ))}
      <Button onClick={() => void navigate(spaceInvitePath(space.spaceId))}>
        가족 초대하기
      </Button>
      <Notice
        title="가족 관리 기능을 준비하고 있어요"
        body="현재 참여 중인 가족을 확인할 수 있어요. 초대와 구성원 관리는 연결 후 이용할 수 있어요."
      />
    </>
  );
}
