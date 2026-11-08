import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { PageLayout } from "@/components/layout";
import { ErrorState, LoadingState } from "@/components/feedback";
import { resetCsrfToken } from "@/lib/api";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { useSession } from "@/features/auth/model/useSession";
import {
  clearLoginReturn,
  readLoginReturn,
} from "@/features/auth/model/loginReturn";
import { SessionStatus } from "@/features/auth/ui/SessionStatus";
import { useCareSpaces } from "@/features/carespace/model/useCareSpaces";
import { paths, spacePath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";

export function AuthCallbackPage() {
  return isMockPreviewEnabled ? (
    <Navigate
      to={paths.spaces}
      replace
    />
  ) : (
    <AuthCallback />
  );
}

function AuthCallback() {
  const session = useSession();
  const navigate = useAppNavigate();
  const [ready, setReady] = useState(false);
  const [returnTo] = useState(readLoginReturn);
  const verified = session.status === "authenticated" && !session.revalidation;
  const spaces = useCareSpaces({
    enabled: ready && verified && !returnTo,
  });
  const { check } = session;
  useEffect(() => {
    let active = true;
    resetCsrfToken();
    void check().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [check]);
  const destination =
    ready && verified
      ? (returnTo ??
        (spaces.isSuccess
          ? spaces.data.length === 1
            ? spacePath(spaces.data[0].spaceId)
            : paths.spaces
          : null))
      : null;
  useEffect(() => {
    if (!destination) return;
    clearLoginReturn();
    void navigate(destination, { replace: true });
  }, [destination, navigate]);
  if (!ready || session.status === "checking") return <SessionStatus />;
  if (session.status === "anonymous")
    return (
      <PageLayout>
        <ErrorState
          reason="no-permission"
          title="로그인을 확인하지 못했어요"
          body="로그인을 다시 진행해 주세요. 계속 발생하면 브라우저의 쿠키 허용 설정을 확인해 주세요."
          actionLabel="로그인 화면으로"
          onAction={() => void navigate(paths.login, { replace: true })}
        />
      </PageLayout>
    );
  if (!verified) return <SessionStatus />;
  return (
    <PageLayout>
      {spaces.isError && !returnTo ? (
        <ErrorState
          reason="load-error"
          title="참여 공간을 불러오지 못했어요"
          loading={spaces.isFetching}
          onAction={() => void spaces.refetch()}
        />
      ) : (
        <LoadingState label="참여 공간으로 이동하고 있어요" />
      )}
    </PageLayout>
  );
}
