import { useLocation } from "react-router";
import { DetailLayout } from "@/components/layout";
import { Notice } from "@/components/feedback";
import { useSession } from "@/features/auth/model/useSession";
import { useOAuthLogin } from "@/features/auth/model/useOAuthLogin";
import { SocialLoginOptions } from "@/features/auth/ui/SocialLoginOptions";
import { paths } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { IntegrationPendingPage } from "@/pages/error/IntegrationPendingPage";

export function ConnectedInvitationPage() {
  const session = useSession();
  const oauth = useOAuthLogin();
  const location = useLocation();
  const navigate = useAppNavigate();
  if (session.status === "authenticated")
    return <IntegrationPendingPage title="초대 참여" />;
  return (
    <DetailLayout
      title="초대 참여"
      onBack={() => void navigate(paths.landing)}
    >
      <h1 className="text-hm-title-page">한마음에 로그인</h1>
      <Notice
        title="로그인하면 이 초대 주소로 돌아와요"
        body="로그인만으로 공간에 참여하지 않아요. 초대 확인과 참여 기능은 준비 중이에요."
      />
      <SocialLoginOptions
        disabled={session.status === "checking"}
        loadingProvider={oauth.provider}
        onLogin={(provider) =>
          void oauth.start(
            provider,
            `${location.pathname}${location.search}${location.hash}`,
          )
        }
      />
      {oauth.error && (
        <Notice
          tone="error"
          role="alert"
          title="로그인 시작 실패"
          body={oauth.error}
        />
      )}
    </DetailLayout>
  );
}
