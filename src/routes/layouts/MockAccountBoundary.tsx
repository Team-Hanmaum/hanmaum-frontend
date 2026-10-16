import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useMockAccount } from "@/features/user/model/mockAccount";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { paths } from "../paths";

export function MockAccountBoundary({ children }: { children: ReactNode }) {
  const { status } = useMockAccount();
  const { pathname } = useLocation();
  const protectedPath = /^\/(spaces|account)(\/|$)/.test(pathname);
  if (isMockPreviewEnabled && protectedPath) {
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
