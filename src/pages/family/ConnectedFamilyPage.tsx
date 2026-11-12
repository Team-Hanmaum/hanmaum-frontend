import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { Button, MenuRow } from "@/components/ui";
import { FamilyMember } from "@/features/carespace/ui";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { toSpaceView } from "@/features/dashboard/model/homeData";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useAppNavigate } from "@/routes/useAppNavigate";
import {
  paths,
  spaceInvitePath,
  familyMembersPath,
  familyTransferPath,
  familyLeavePath,
} from "@/routes/paths";
import { ApiError } from "@/lib/api";
import { useLocation } from "react-router";

export function ConnectedFamilyPage() {
  const { space } = useConnectedSpace();
  const members = useSpaceMembers(space.spaceId);
  const navigate = useAppNavigate();
  const { state } = useLocation();
  const removal = (
    state as {
      familyAction?: {
        kind: string;
        spaceId: string;
      };
    } | null
  )?.familyAction;
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
      {removal?.kind === "removed" && removal.spaceId === space.spaceId && (
        <Notice
          title="구성원 내보내기를 완료했어요"
          body="현재 함께하는 가족은 아래 목록에서 확인해 주세요."
        />
      )}
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
      <h2 className="text-hm-heading-section">가족 관리</h2>
      {space.role === "OWNER" && (
        <>
          <MenuRow
            icon="family-brand"
            title="구성원 관리"
            description="함께하는 가족의 참여 관리"
            onClick={() => void navigate(familyMembersPath(space.spaceId))}
          />
          <MenuRow
            icon="person"
            title="소유권 이전"
            description="가족에게 소유자 역할을 넘겨요"
            onClick={() => void navigate(familyTransferPath(space.spaceId))}
          />
        </>
      )}
      <MenuRow
        tone="danger"
        title="공간 나가기"
        description={
          space.role === "OWNER"
            ? "소유권 이전 또는 공간 삭제 후 가능"
            : "내 참여를 종료해요"
        }
        onClick={() => void navigate(familyLeavePath(space.spaceId))}
      />
    </>
  );
}
