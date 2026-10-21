import { useAppNavigate } from "@/routes/useAppNavigate";
import { useState } from "react";

import { Notice } from "@/components/feedback";
import { Button, TextAction } from "@/components/ui";
import { mockAccount, useMockAccount } from "@/features/user/model/mockAccount";
import { useMockAction } from "@/lib/useMockAction";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { paths } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";

const states = [
  { value: "default", label: "로그아웃 확인" },
  { value: "error", label: "처리 실패" },
  { value: "unknown", label: "결과 미확인" },
  { value: "expired", label: "인증 만료" },
] as const;
export function LogoutPage() {
  const navigate = useAppNavigate();
  const onBack = useBackNavigation(paths.account);
  const account = useMockAccount();
  const [state, setState] = useMockScreenState(states, "default");
  const [error, setError] = useState("");
  const { pending, run } = useMockAction();
  const unknown = account.status === "logout-unknown";
  function submit() {
    setError("");
    run(() => {
      if (!unknown && state === "error") {
        setError("로그아웃하지 못했어요. 다시 시도해 주세요.");
        setState("default");
        return;
      }
      if (!unknown && state === "unknown") {
        mockAccount.setStatus("logout-unknown");
        return;
      }
      mockAccount.setStatus("signed-out");
      void navigate(
        `${paths.login}?reason=${state === "expired" ? "expired" : "signed-out"}`,
        { replace: true },
      );
    });
  }
  return (
    <AccountPageLayout
      title="로그아웃"
      onBack={
        unknown
          ? () => void navigate(paths.logout, { replace: true, motion: "back" })
          : onBack
      }
      preview={{
        value: state,
        options: states,
        onChange: (value) => {
          if (!pending && !unknown) setState(value);
        },
      }}
      actions={
        <>
          <Button
            loading={pending}
            disabled={!isMockPreviewEnabled}
            onClick={submit}
          >
            {unknown
              ? "로그아웃 상태 확인"
              : state === "expired"
                ? "다시 로그인"
                : "로그아웃"}
          </Button>
          {!unknown && (
            <TextAction
              disabled={pending}
              onClick={onBack}
            >
              계속 이용하기
            </TextAction>
          )}
        </>
      }
    >
      <h1 className="text-hm-title-page whitespace-pre-line">
        {unknown
          ? "로그아웃 상태를\n확인하지 못했어요"
          : state === "expired"
            ? "다시 로그인해 주세요"
            : "로그아웃할까요?"}
      </h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        {unknown
          ? "연결 상태를 확인한 뒤 다시 시도해 주세요."
          : "다시 로그인하면 참여 중인 공간을 확인할 수 있어요."}
      </p>
      <Notice
        tone="neutral"
        title={
          unknown
            ? "이전 돌봄 화면은 가려두었어요"
            : "계정과 돌봄 기록은 유지돼요"
        }
        body={
          unknown
            ? "로그아웃 상태가 확인되면 안내할게요."
            : "로그아웃한 뒤 돌봄 정보와 소식을 보려면 다시 로그인해야 해요."
        }
      />
      {error && (
        <Notice
          tone="error"
          role="alert"
          title="로그아웃 실패"
          body={error}
        />
      )}
    </AccountPageLayout>
  );
}
