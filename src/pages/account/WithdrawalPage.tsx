import { useAppNavigate } from "@/routes/useAppNavigate";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { Badge, Button, MenuRow, TextAction } from "@/components/ui";
import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { mockCareSpaces } from "@/features/carespace/model/mockCareSpaces";
import { mockAccount, useMockAccount } from "@/features/user/model/mockAccount";
import { withdrawMockAccount } from "@/features/user/model/mockWithdrawal";
import { AccountInfoCard } from "@/features/user/ui/AccountInfoCard";
import { WithdrawalSpaceList } from "@/features/user/ui/WithdrawalSpaceList";
import { useMockAction } from "@/lib/useMockAction";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import {
  familyDeletePath,
  familyTransferPath,
  paths,
  spaceInvitePath,
} from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";
const states = [
  { value: "default", label: "현재 공간 기준" },
  { value: "loading", label: "공간 확인 중" },
  { value: "load-error", label: "조회 실패" },
  { value: "error", label: "탈퇴 실패" },
  { value: "unknown", label: "결과 미확인" },
] as const;
export function WithdrawalPage() {
  const { spaces } = useMockCareSpaces();
  const account = useMockAccount();
  const navigate = useAppNavigate();
  const [params] = useSearchParams();
  const owned = spaces.filter((space) => space.role === "owner");
  const [state, setState] = useMockScreenState(states, "default");
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const { pending, run } = useMockAction();
  const unknown = account.status === "withdrawal-unknown";
  const complete = () =>
    void navigate(paths.withdrawalComplete, { replace: true });
  const cancel = () => {
    if (!pending && !unknown)
      void navigate(paths.account, { replace: true, motion: "back" });
  };
  function submit() {
    setError("");
    run(() => {
      try {
        if (unknown) {
          withdrawMockAccount();
          complete();
          return;
        }
        if (
          mockCareSpaces
            .getSnapshot()
            .spaces.some((space) => space.role === "owner")
        ) {
          setChecked(true);
          return;
        }
        if (state === "error") {
          setError("탈퇴하지 못했어요. 계정과 참여 상태는 유지돼요.");
          setState("default");
          return;
        }
        if (state === "unknown") {
          mockAccount.setStatus("withdrawal-unknown");
          return;
        }
        withdrawMockAccount();
        complete();
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "처리하지 못했어요. 다시 확인해 주세요.",
        );
      }
    });
  }
  const ready = state !== "loading" && state !== "load-error";
  return (
    <AccountPageLayout
      title="회원 탈퇴"
      onBack={cancel}
      preview={{
        value: state,
        options: states,
        onChange: (value) => {
          if (!pending && !unknown) {
            setState(value);
            setError("");
            setChecked(false);
          }
        },
      }}
      actions={
        (ready || unknown) && (
          <>
            <Button
              variant={!owned.length && !unknown ? "destructive" : "primary"}
              loading={pending}
              disabled={!isMockPreviewEnabled}
              onClick={submit}
            >
              {unknown
                ? "탈퇴 처리 상태 확인"
                : owned.length
                  ? "정리 상태 확인하기"
                  : "계정 정보 삭제하고 탈퇴"}
            </Button>
            {!unknown && (
              <TextAction
                disabled={pending}
                onClick={cancel}
              >
                탈퇴 취소
              </TextAction>
            )}
          </>
        )
      }
    >
      {unknown ? (
        <>
          <h1 className="text-hm-title-page">
            탈퇴 처리 결과를
            <br />
            확인하지 못했어요
          </h1>
          <Notice
            title="이전 돌봄 화면은 가려두었어요"
            body="처리 상태를 확인할 때까지 다시 탈퇴 요청을 보내지 않아요."
          />
        </>
      ) : state === "loading" ? (
        <LoadingState label="소유 중인 공간을 확인하고 있어요" />
      ) : state === "load-error" ? (
        <ErrorState
          reason="load-error"
          title="공간 목록을 불러오지 못했어요"
          actionLabel="다시 확인"
          onAction={() => setState("default")}
        />
      ) : owned.length ? (
        <>
          <h1 className="text-hm-title-page">
            소유 중인 공간을
            <br />
            먼저 정리해 주세요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            가족에게 소유권을 넘기거나 공간을 삭제한 뒤 탈퇴할 수 있어요.
          </p>
          <Badge
            className="self-start"
            label={`소유 중인 공간 ${owned.length}개`}
          />
          <WithdrawalSpaceList
            spaces={owned}
            onTransfer={(id) =>
              void navigate(`${familyTransferPath(id)}?returnTo=withdrawal`)
            }
            onDelete={(id) =>
              void navigate(`${familyDeletePath(id)}?returnTo=withdrawal`)
            }
            onInvite={(id) =>
              void navigate(`${spaceInvitePath(id)}?returnTo=withdrawal`)
            }
          />
          <Notice
            tone="error"
            title="공간 삭제는 별도 작업이에요"
            body="이전하면 공간은 유지돼요. 삭제하면 해당 공간과 자료는 복구할 수 없어요."
          />
          {checked && (
            <Notice
              role="status"
              title={`아직 소유 중인 공간이 ${owned.length}개 있어요`}
              body="모든 소유 공간을 정리한 뒤 탈퇴할 수 있어요."
            />
          )}
        </>
      ) : (
        <>
          <Badge
            className="self-start"
            label="소유 중인 공간 없음"
            tone="brand"
          />
          <h1 className="text-hm-title-page">
            탈퇴하면
            <br />
            이렇게 처리돼요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            삭제되는 계정 정보와 남는 공동 기록을 확인해 주세요.
          </p>
          <AccountInfoCard title="삭제되는 정보">
            <p className="text-hm-body-default">
              한마음 계정의 기본 정보
              <br />
              소셜 계정과의 연결 정보
              <br />
              로그인·인증 정보
            </p>
          </AccountInfoCard>
          <Notice
            tone="error"
            title="모든 참여 공간의 접근이 종료돼요"
            body="이 계정으로 참여한 공간을 더 이상 볼 수 없어요."
          />
          <AccountInfoCard title="가족과 공유한 기록은 남아요">
            <p className="text-hm-body-default">
              공유 돌봄 기록과 변경 이력의 작성자는 ‘탈퇴한 사용자’로 표시돼요.
              <br />
              탈퇴만으로 가족 공간 전체가 삭제되지는 않아요.
            </p>
          </AccountInfoCard>
          <p className="text-hm-body-default text-hm-text-secondary">
            삭제할 소식이 있다면 탈퇴 전에 별도의 소식 삭제 절차를 진행해
            주세요.
          </p>
          <MenuRow
            icon="news-brand"
            title="소식 확인하러 가기"
            onClick={() => void navigate(paths.withdrawalNews)}
          />
        </>
      )}
      {params.get("cleanup") === "deleted" && !unknown && (
        <Notice
          role="status"
          title="공간 삭제를 완료했어요"
          body="회원 탈퇴는 아직 하지 않았어요. 남은 소유 공간과 탈퇴 내용을 확인해 주세요."
        />
      )}
      {error && (
        <Notice
          tone="error"
          role="alert"
          title="처리하지 못했어요"
          body={error}
        />
      )}
    </AccountPageLayout>
  );
}
