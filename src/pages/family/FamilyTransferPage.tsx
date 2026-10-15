import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { ErrorState, Notice } from "@/components/feedback";
import { Button, SelectionRow, TextAction } from "@/components/ui";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import { familyTransferPath, spaceInvitePath, spacePath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function FamilyTransferPage() {
  const space = useOutletContext<CareSpaceView>();
  const navigate = useNavigate();
  const onBack = useBackNavigation(spacePath(space.id, "family"));
  const [selectedId, setSelectedId] = useState("");
  const owner = space.members.find((member) => member.role === "owner");
  const candidates = space.members.filter(
    (member) => member.role === "member" && !member.self,
  );
  const selected = candidates.find((member) => member.id === selectedId);
  return (
    <FamilyPageLayout
      title="소유권 이전"
      spaceId={space.id}
      onBack={onBack}
      actions={
        space.role === "owner" &&
        (candidates.length ? (
          <>
            <Button
              disabled={!selected}
              onClick={() =>
                void navigate(familyTransferPath(space.id, selectedId))
              }
            >
              이전 내용 확인
            </Button>
            <TextAction onClick={onBack}>취소</TextAction>
          </>
        ) : (
          <Button onClick={() => void navigate(spaceInvitePath(space.id))}>
            가족 초대하기
          </Button>
        ))
      }
    >
      {space.role !== "owner" ? (
        <ErrorState
          reason="no-permission"
          title="소유자만 역할을 이전할 수 있어요"
          actionLabel="가족 화면으로"
          onAction={() => void navigate(spacePath(space.id, "family"))}
        />
      ) : candidates.length ? (
        <>
          <h1 className="text-hm-title-page">
            누가 소유자 역할을
            <br />
            이어받을까요?
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {careSpaceName(space)} · 현재 소유자 {owner?.name}
          </p>
          <Notice
            title="새 소유자가 맡는 일"
            body="제안·변경 요청을 최종 반영하고 공간과 가족의 참여를 관리해요."
          />
          <fieldset className="flex flex-col gap-hm-24">
            <legend className="sr-only">새 소유자 선택</legend>
            {candidates.map((member) => (
              <SelectionRow
                key={member.id}
                control="radio"
                name="new-owner"
                value={member.id}
                label={member.name}
                description="현재 구성원"
                checked={selectedId === member.id}
                onChange={() => setSelectedId(member.id)}
              />
            ))}
          </fieldset>
          <p className="text-hm-caption-default text-hm-text-secondary">
            현재 함께하는 가족 중 한 명을 골라 주세요.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-hm-title-page">
            아직 다른 가족이
            <br />
            없어요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            가족을 초대하고 참여가 완료되면 소유자 역할을 넘길 수 있어요.
          </p>
          {owner && (
            <FamilyMember
              {...owner}
              name={`${owner.name} · 나`}
              initial={owner.name[0]}
              detail="나만 참여 중"
            />
          )}
          <Notice
            title="기록을 이어서 돌볼 가족을 초대해요"
            body="소유자 역할은 현재 참여 중인 가족에게 넘길 수 있어요."
          />
        </>
      )}
    </FamilyPageLayout>
  );
}
