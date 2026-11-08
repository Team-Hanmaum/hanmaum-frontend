import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { Button } from "@/components/ui";
import { FamilyMember } from "@/features/carespace/ui";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { toSpaceView } from "@/features/dashboard/model/homeData";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { paths, spaceInvitePath } from "@/routes/paths";
import { ApiError } from "@/lib/api";

export function ConnectedFamilyPage() {
  const { space } = useConnectedSpace();
  const members = useSpaceMembers(space.spaceId);
  const navigate = useAppNavigate();
  if (
    members.error instanceof ApiError &&
    [403, 404].includes(members.error.status ?? 0)
  )
    return (
      <ErrorState
        reason="no-permission"
        title="가족 정보를 확인할 수 없어요"
        actionLabel="참여 공간 선택"
        onAction={() => void navigate(paths.spaces)}
      />
    );
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
      {members.isError && (
        <Notice
          tone="error"
          title="최신 가족 정보를 불러오지 못했어요"
          body="마지막으로 확인한 가족 목록이에요."
          action={{
            label: "다시 불러오기",
            onClick: () => void members.refetch(),
          }}
        />
      )}
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
