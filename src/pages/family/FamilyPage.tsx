import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { MenuGroup } from "@/components/layout/MenuGroup";
import { PageTitleWithAction } from "@/components/layout";
import { FamilyAvatar } from "@/features/carespace/ui";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { toSpaceView } from "@/features/dashboard/model/homeData";
import { useSpaceContext } from "@/routes/useSpaceContext";
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

export function FamilyPage() {
  const { space } = useSpaceContext();
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
      <PageTitleWithAction
        title={`가족 ${members.data.length}명`}
        action={{
          label: "가족 초대",
          onClick: () => void navigate(spaceInvitePath(space.spaceId)),
        }}
      />
      <ul
        aria-label="함께 돌보는 가족"
        className="grid grid-cols-3 gap-x-hm-8 gap-y-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-16"
      >
        {toSpaceView(space, members.data).members.map((member) => (
          <li
            key={member.id}
            className="flex min-w-0 justify-center"
          >
            <FamilyAvatar
              name={member.name}
              profileImageUrl={member.profileImageUrl}
              self={member.self}
              roleLabel={`${member.self ? "나 · " : ""}${member.role === "owner" ? "소유자" : "구성원"}`}
            />
          </li>
        ))}
      </ul>
      <MenuGroup
        title="가족 관리"
        items={[
          ...(space.role === "OWNER"
            ? ([
                {
                  icon: "family-brand",
                  title: "구성원 관리",
                  onClick: () =>
                    void navigate(familyMembersPath(space.spaceId)),
                },
                {
                  icon: "person",
                  title: "소유권 이전",
                  onClick: () =>
                    void navigate(familyTransferPath(space.spaceId)),
                },
              ] as const)
            : []),
          {
            icon: "logout-error",
            tone: "danger",
            title: "공간 나가기",
            description:
              space.role === "OWNER"
                ? "소유권 이전 또는 공간 삭제 후 가능"
                : undefined,
            onClick: () => void navigate(familyLeavePath(space.spaceId)),
          },
        ]}
      />
    </>
  );
}
