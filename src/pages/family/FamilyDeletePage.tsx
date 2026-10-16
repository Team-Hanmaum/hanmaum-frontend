import { useNavigate, useOutletContext } from "react-router";
import { ErrorState, Notice } from "@/components/feedback";
import { Button, TextAction } from "@/components/ui";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import {
  useFamilyExit,
  familyExitStates,
} from "@/features/carespace/model/useFamilyExit";
import { FamilyInfoCard } from "@/features/carespace/ui/FamilyInfoCard";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import {
  familyLeavePath,
  familyTransferPath,
  paths,
  spacePath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function FamilyDeletePage() {
  const space = useOutletContext<CareSpaceView>();
  const navigate = useNavigate();
  const { withdrawing, withReturn, returnToWithdrawal } = useWithdrawalReturn();
  const onBack = useBackNavigation(familyLeavePath(space.id));
  const [state, setState] = useMockScreenState(familyExitStates, "default");
  const { pending, error, submit, clearError } = useFamilyExit(
    space.id,
    "deleteSpace",
    (noticeId) =>
      void navigate(
        withdrawing ? `${paths.withdrawal}?cleanup=deleted` : paths.spaces,
        {
          replace: true,
          state: { familyExit: noticeId },
        },
      ),
  );
  const allowed = space.role === "owner" && state !== "forbidden";
  return (
    <FamilyPageLayout
      title="공간 삭제"
      spaceId={space.id}
      onBack={withdrawing ? returnToWithdrawal : onBack}
      preview={{
        value: state,
        options: familyExitStates,
        onChange: (value) => {
          if (!pending) {
            clearError();
            setState(value);
          }
        },
      }}
      actions={
        allowed && (
          <>
            <Button
              variant="destructive"
              loading={pending}
              onClick={() =>
                submit(state === "error", () => setState("default"))
              }
            >
              공간과 모든 기록 삭제
            </Button>
            <TextAction
              disabled={pending}
              onClick={withdrawing ? returnToWithdrawal : onBack}
            >
              취소
            </TextAction>
          </>
        )
      }
    >
      {!allowed ? (
        <ErrorState
          reason="no-permission"
          title="소유자만 공간을 삭제할 수 있어요"
          actionLabel="가족 화면으로"
          onAction={() => void navigate(spacePath(space.id, "family"))}
        />
      ) : (
        <>
          <h1 className="text-hm-title-page">
            {careSpaceName(space)}을<br />
            삭제할까요?
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            이 공간을 함께 쓰는 모든 가족에게 적용돼요.
          </p>
          <Notice
            tone="error"
            title="삭제하면 복구할 수 없어요"
            body="삭제한 공간과 기록은 되돌릴 수 없어요."
          />
          <FamilyInfoCard title="함께 삭제되는 정보">
            소식 원본 · 돌봄 항목 · 제안
            <br />
            근거 · 변경 이력 · 연결된 표시 내용
          </FamilyInfoCard>
          <FamilyInfoCard title="가족의 접근">
            모든 가족이 이 공간에 접근할 수 없게 돼요.
          </FamilyInfoCard>
          <FamilyInfoCard title="기존 링크">
            이 공간의 초대·공유 링크도 사용할 수 없어요.
          </FamilyInfoCard>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              void navigate(withReturn(familyTransferPath(space.id)))
            }
          >
            기록을 남기고 소유권 이전하기
          </Button>
          {error && (
            <Notice
              tone="error"
              role="alert"
              title="공간을 삭제하지 못했어요"
              body={error}
            />
          )}
        </>
      )}
    </FamilyPageLayout>
  );
}
