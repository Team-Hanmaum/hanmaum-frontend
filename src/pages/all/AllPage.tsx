import { useNavigate, useOutletContext } from "react-router";
import { Badge, MenuRow } from "@/components/ui";
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
  const navigate = useNavigate();
  const self = space.members.find((member) => member.self)!;
  const go = (path: string) => () => void navigate(path);
  return (
    <>
      <h1 className="text-hm-title-page">전체</h1>
      <Badge
        tone={space.role === "owner" ? "brand" : "neutral"}
        className="self-start"
        label={`${self.name} · ${space.role === "owner" ? "소유자" : "구성원"}`}
      />
      <h2 className="text-hm-heading-section">돌봄 공간</h2>
      <MenuRow
        icon="person"
        title="돌봄 대상·공간 정보"
        description={`${space.subjectLabel}의 돌봄`}
        onClick={go(spaceInfoPath(space.id))}
      />
      <MenuRow
        icon="family-brand"
        title="함께하는 가족"
        description={`${space.members.map((m) => m.name).join(" · ")} / ${space.members.length}명`}
        onClick={go(spacePath(space.id, "family"))}
      />
      <MenuRow
        icon="plus"
        title="가족 초대"
        description="초대 링크로 함께 돌봐요"
        onClick={go(spaceInvitePath(space.id))}
      />
      <MenuRow
        icon="grid-brand"
        title="참여 공간 선택"
        description="다른 돌봄 공간으로 전환"
        onClick={go(paths.spaces)}
      />
      <h2 className="text-hm-heading-section">돌봄 기록과 확인</h2>
      <MenuRow
        icon="care-brand"
        title="돌봄 항목"
        description="일정 · 할 일 · 질문 · 관찰 · 안내"
        onClick={go(spacePath(space.id, "care"))}
      />
      <MenuRow
        icon="news-brand"
        title="가족 소식"
        description="함께 남긴 소식"
        onClick={go(spacePath(space.id, "news"))}
      />
      <MenuRow
        icon="check"
        title="확인할 내용"
        description={
          space.role === "owner"
            ? "제안과 승인 요청 확인"
            : "내가 보낸 요청과 제안 확인"
        }
        onClick={go(proposalListPath(space.id))}
      />
      <h2 className="text-hm-heading-section">현재 공간 관리</h2>
      {space.role === "owner" && (
        <>
          <MenuRow
            icon="family-brand"
            title="구성원 관리"
            description="함께하는 가족의 참여 관리"
            onClick={go(familyMembersPath(space.id))}
          />
          <MenuRow
            icon="person"
            title="소유권 이전"
            description="가족에게 소유자 역할을 넘겨요"
            onClick={go(familyTransferPath(space.id))}
          />
        </>
      )}
      <MenuRow
        tone="danger"
        icon="chevron-right-error"
        title="공간 나가기"
        description={
          space.role === "owner"
            ? "소유권 이전 또는 공간 삭제 후 가능"
            : "내 참여를 종료해요"
        }
        onClick={go(familyLeavePath(space.id))}
      />
      {space.role === "owner" && (
        <MenuRow
          tone="danger"
          icon="chevron-right-error"
          title="공간 삭제"
          description="소유자만 가능 · 삭제 후 복구 불가"
          onClick={go(familyDeletePath(space.id))}
        />
      )}
      <h2 className="text-hm-heading-section">내 계정</h2>
      <MenuRow
        icon="person"
        title="내 계정"
        description="이름과 로그인 방식"
        onClick={go(accountPath(space.id))}
      />
      <MenuRow
        tone="danger"
        icon="chevron-right-error"
        title="회원 탈퇴"
        description="모든 참여 공간의 접근 종료"
        onClick={go(paths.withdrawal)}
      />
      <MenuRow
        tone="danger"
        icon="chevron-right-error"
        title="로그아웃"
        onClick={go(paths.logout)}
      />
    </>
  );
}
