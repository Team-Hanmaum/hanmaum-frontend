import { Activity, Fragment, useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "@/features/auth/model/useSession";
import { saveLoginReturn } from "@/features/auth/model/loginReturn";
import { SessionStatus } from "@/features/auth/ui/SessionStatus";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { MockAccountBoundary } from "./MockAccountBoundary";
import { paths } from "../paths";
import { SessionRevalidationNotice } from "@/features/auth/ui/SessionRevalidationNotice";

function LoginRedirect({ reason }: { reason: string }) {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (reason !== "signed-out") saveLoginReturn(`${pathname}${search}${hash}`);
  }, [pathname, search, hash, reason]);
  return (
    <Navigate
      to={`${paths.login}?reason=${reason}`}
      replace
    />
  );
}

export function SessionBoundary({ children }: { children: ReactNode }) {
  const session = useSession();
  const { pathname } = useLocation();
  if (isMockPreviewEnabled)
    return <MockAccountBoundary>{children}</MockAccountBoundary>;
  const publicPath = !/^\/(spaces|account|onboarding)(\/|$)/.test(pathname);
  if (session.status === "signing-out" || session.status === "logout-unknown")
    return pathname === paths.logout ? (
      <Fragment key={session.accountId}>
        <Activity mode="visible">{children}</Activity>
      </Fragment>
    ) : (
      <SessionStatus />
    );
  if (publicPath) return children;
  if (session.status === "anonymous")
    return <LoginRedirect reason={session.reason} />;
  if (session.status !== "authenticated") return <SessionStatus />;
  // A different account must never inherit mounted form/domain state.
  return (
    <Fragment key={session.user.userId}>
      {children}
      <SessionRevalidationNotice />
    </Fragment>
  );
}
