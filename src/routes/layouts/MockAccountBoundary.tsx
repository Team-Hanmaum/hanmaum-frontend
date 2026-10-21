import { useAppNavigate } from "@/routes/useAppNavigate";
import { AppLink } from "@/routes/AppLink";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useMockAccount } from "@/features/user/model/mockAccount";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { paths } from "../paths";
import { DetailLayout } from "@/components/layout";
import { Notice } from "@/components/feedback";

export function MockAccountBoundary({ children }: { children: ReactNode }) {
  const { status } = useMockAccount();
  const { pathname } = useLocation();
  const navigate = useAppNavigate();
  const protectedPath = /^\/(spaces|account)(\/|$)/.test(pathname);
  if (!isMockPreviewEnabled && /^\/account(\/|$)/.test(pathname))
    return (
      <DetailLayout
        title="내 계정"
        onBack={() => void navigate(paths.login, { motion: "back" })}
      >
        <Notice
          title="계정 기능 연결 전이에요"
          body="현재 계정 화면은 Mock 모드에서만 확인할 수 있어요."
        />
        <AppLink to={paths.login}>로그인 화면으로</AppLink>
      </DetailLayout>
    );
  if (isMockPreviewEnabled) {
    // 탈퇴 직후 지연 로딩 중에도 완료 화면 이동이 로그인 가드에 취소되지 않게 한다.
    if (status === "withdrawn" && pathname === paths.withdrawal)
      return (
        <Navigate
          to={paths.withdrawalComplete}
          replace
        />
      );
    if (status === "logout-unknown" && pathname !== paths.logout)
      return (
        <Navigate
          to={paths.logout}
          replace
        />
      );
    if (status === "withdrawal-unknown" && pathname !== paths.withdrawal)
      return (
        <Navigate
          to={paths.withdrawal}
          replace
        />
      );
    if (
      (status === "signed-out" || status === "withdrawn") &&
      protectedPath &&
      pathname !== paths.withdrawalComplete
    )
      return (
        <Navigate
          to={`${paths.login}?reason=${status}`}
          replace
        />
      );
  }
  return children;
}
