import { useAppNavigate } from "@/routes/useAppNavigate";
import { useOutletContext } from "react-router";
import { MenuGroup } from "@/components/layout/MenuGroup";
import { usePwaInstall } from "@/lib/pwa/installContext";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import {
  accountPath,
  familyDeletePath,
  familyLeavePath,
  familyMembersPath,
  familyTransferPath,
  paths,
  proposalListPath,
  spaceInfoPath,
  spaceInvitePath,
  spacePath,
} from "@/routes/paths";

export function AllPage() {
  const space = useOutletContext<CareSpaceView>();
  const navigate = useAppNavigate();
  const { installed, showInstall } = usePwaInstall();
  const owner = space.role === "owner";
  const go = (path: string) => () => void navigate(path);
  return (
    <>
      <h1 className="text-hm-title-page">전체</h1>
      <MenuGroup
        items={[
          {
            icon: "person",
            title: "내 계정",
            onClick: go(accountPath(space.id)),
          },
        ]}
      />
      <MenuGroup
        title="돌봄 공간"
        items={[
          {
            icon: "person",
            title: "돌봄 대상·공간 정보",
            onClick: go(spaceInfoPath(space.id)),
          },
          {
            icon: "family-brand",
            title: "함께하는 가족",
            onClick: go(spacePath(space.id, "family")),
          },
          {
            icon: "plus",
            title: "가족 초대",
            onClick: go(spaceInvitePath(space.id)),
          },
          {
            icon: "grid-brand",
            title: "참여 공간 선택",
            onClick: () =>
              void navigate(paths.spaces, {
                state: { fromSpace: { id: space.id, tab: "all" } },
              }),
          },
        ]}
      />
      <MenuGroup
        title="돌봄 기록과 확인"
        items={[
          {
            icon: "care-brand",
            title: "돌봄 항목",
            onClick: go(spacePath(space.id, "care")),
          },
          {
            icon: "news-brand",
            title: "가족 소식",
            onClick: go(spacePath(space.id, "news")),
          },
          {
            icon: "check",
            title: "제안·요청",
            onClick: go(proposalListPath(space.id, "review", "all")),
          },
        ]}
      />
      <MenuGroup
        title="현재 공간 관리"
        items={[
          ...(owner
            ? ([
                {
                  icon: "family-brand",
                  title: "구성원 관리",
                  onClick: go(familyMembersPath(space.id)),
                },
                {
                  icon: "person",
                  title: "소유권 이전",
                  onClick: go(familyTransferPath(space.id)),
                },
              ] as const)
            : []),
          {
            icon: "logout-error",
            tone: "danger",
            title: "공간 나가기",
            onClick: go(familyLeavePath(space.id)),
          },
          ...(owner
            ? ([
                {
                  icon: "alert-error",
                  tone: "danger",
                  title: "공간 삭제",
                  onClick: go(familyDeletePath(space.id)),
                },
              ] as const)
            : []),
        ]}
      />
      <MenuGroup
        title="앱과 계정"
        items={[
          ...(!installed
            ? ([
                { icon: "plus", title: "한마음 설치", onClick: showInstall },
              ] as const)
            : []),
          { icon: "logout", title: "로그아웃", onClick: go(paths.logout) },
          {
            icon: "person-error",
            tone: "danger",
            title: "회원 탈퇴",
            onClick: go(paths.withdrawal),
          },
        ]}
      />
    </>
  );
}
