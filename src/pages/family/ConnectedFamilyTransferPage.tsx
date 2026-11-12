import { useState } from "react";
import { useParams } from "react-router";
import { ErrorState, Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { Button, SelectionRow, TextAction } from "@/components/ui";
import { useFamilyManagement } from "@/features/carespace/model/useFamilyManagement";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ApiError } from "@/lib/api";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import {
  familyDeletePath,
  familyTransferPath,
  paths,
  spaceInvitePath,
  spacePath,
} from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function ConnectedFamilyTransferPage() {
  const { careSpaceId } = useParams();
  return <TransferSelection key={careSpaceId} />;
}

function TransferSelection() {
  const data = useFamilyManagement();
  const { space, members, spaceId } = data;
  const navigate = useAppNavigate();
  const { withReturn, withdrawing, returnToWithdrawal } = useWithdrawalReturn();
  const onBack = useBackNavigation(withReturn(spacePath(spaceId, "family")));
  const recover = withdrawing ? returnToWithdrawal : onBack;
  const [selectedId, setSelectedId] = useState("");
  const { blocker, allowNavigation } = useUnsavedChanges(!!selectedId);
  const owner = members?.find((member) => member.role === "OWNER");
  const candidates =
    members?.filter((member) => member.role === "MEMBER" && !member.isMe) ?? [];
  const selected = candidates.find(
    (member) => member.membershipId === selectedId,
  );
  const denied =
    data.error instanceof ApiError &&
    [403, 404].includes(data.error.status ?? 0);
  const allowed = space?.role === "OWNER" && !denied;
  const loaded = !!space && !!members;
  const ready = loaded && allowed && !data.error && !data.refreshing;
  return (
    <FamilyPageLayout
      connected
      title="소유권 이전"
      spaceId={spaceId}
      tabs={ready && !candidates.length && !withdrawing}
      onBack={recover}
      actions={
        loaded && allowed ? (
          candidates.length ? (
            <>
              <Button
                disabled={!ready || !selected}
                onClick={() =>
                  allowNavigation(
                    () =>
                      void navigate(
                        withReturn(familyTransferPath(spaceId, selectedId)),
                      ),
                  )
                }
              >
                이전 내용 확인
              </Button>
              <TextAction onClick={recover}>취소</TextAction>
            </>
          ) : ready ? (
            <>
              <Button
                onClick={() =>
                  void navigate(withReturn(spaceInvitePath(spaceId)))
                }
              >
                가족 초대하기
              </Button>
              <TextAction
                tone="danger"
                onClick={() =>
                  void navigate(withReturn(familyDeletePath(spaceId)))
                }
              >
                공간 삭제 확인
              </TextAction>
            </>
          ) : undefined
        ) : undefined
      }
    >
      {denied ? (
        <ErrorState
          reason="no-permission"
          title="이 공간에 접근할 수 없어요"
          actionLabel={withdrawing ? "탈퇴 절차로 돌아가기" : "참여 공간 선택"}
          onAction={
            withdrawing ? returnToWithdrawal : () => void navigate(paths.spaces)
          }
        />
      ) : !loaded ? (
        <ReviewQueryState
          error={data.error}
          retry={() => void data.refresh()}
        />
      ) : !allowed ? (
        <ErrorState
          reason="no-permission"
          title="소유자만 역할을 이전할 수 있어요"
          actionLabel={withdrawing ? "탈퇴 절차로 돌아가기" : "가족 화면으로"}
          onAction={recover}
        />
      ) : (
        <>
          {data.error && (
            <Notice
              role="alert"
              tone="error"
              title="최신 가족 정보를 확인하지 못했어요"
              body="새 소유자를 선택하기 전에 현재 공간과 가족 목록을 다시 확인해 주세요."
              action={{
                label: "다시 확인",
                onClick: () => void data.refresh(),
              }}
            />
          )}
          {candidates.length ? (
            <>
              <h1 className="text-hm-title-page">
                누가 소유자 역할을
                <br />
                이어받을까요?
              </h1>
              <p className="text-hm-body-default text-hm-text-secondary">
                {space.subjectLabel}의 돌봄 · 현재 소유자{" "}
                {owner?.displayName ?? "이름 미등록"}
              </p>
              <Notice
                title="새 소유자가 맡는 일"
                body="제안·변경 요청을 최종 반영하고 공간과 가족의 참여를 관리해요."
              />
              <fieldset
                className="flex flex-col gap-hm-24"
                disabled={!ready}
              >
                <legend className="sr-only">새 소유자 선택</legend>
                {candidates.map((member) => (
                  <SelectionRow
                    key={member.membershipId}
                    control="radio"
                    name="new-owner"
                    value={member.membershipId}
                    label={member.displayName ?? "이름 미등록"}
                    description="현재 구성원"
                    checked={selectedId === member.membershipId}
                    onChange={() => setSelectedId(member.membershipId)}
                  />
                ))}
              </fieldset>
              {selectedId && !selected && (
                <Notice
                  title="다른 가족을 선택해 주세요"
                  body="선택했던 가족의 참여 상태가 바뀌었어요."
                />
              )}
              <p className="text-hm-caption-default text-hm-text-secondary">
                현재 함께하는 가족 중 한 명을 골라 주세요.
              </p>
            </>
          ) : !data.error ? (
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
                  name={owner.displayName ?? "이름 미등록"}
                  role="owner"
                  self={owner.isMe}
                  detail="나만 참여 중"
                />
              )}
              <Notice
                title="기록을 이어서 돌볼 가족을 초대해요"
                body="소유자 역할은 현재 참여 중인 가족에게 넘길 수 있어요."
              />
            </>
          ) : null}
        </>
      )}
      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        title="소유자 선택을 나갈까요?"
        body="아직 소유권을 이전하지 않았어요. 선택한 가족은 저장되지 않아요."
        confirmLabel="선택하지 않고 나가기"
        cancelLabel="계속 선택하기"
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />
    </FamilyPageLayout>
  );
}
