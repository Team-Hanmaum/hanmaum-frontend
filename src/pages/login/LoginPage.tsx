import { AppLink } from "@/routes/AppLink";
import { DetailLayout } from "@/components/layout";
import { MockNotice } from "@/components/feedback/MockNotice";
import { Notice } from "@/components/feedback";
import { BrandSymbol } from "@/components/ui";
import { SocialLoginOptions } from "@/features/auth/ui/SocialLoginOptions";
import { Navigate, useSearchParams } from "react-router";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { useOAuthLogin } from "@/features/auth/model/useOAuthLogin";
import { useSession } from "@/features/auth/model/useSession";
import { paths } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useLoginPreview } from "./useLoginPreview";

export function LoginPage() {
  const onBack = useBackNavigation(paths.landing);
  const { enabled, provider, message, previewLogin } = useLoginPreview();
  const oauth = useOAuthLogin();
  const session = useSession();
  const [params] = useSearchParams();
  const reason = params.get("reason");
  if (!isMockPreviewEnabled && session.status === "authenticated")
    return (
      <Navigate
        to={paths.authCallback}
        replace
      />
    );
  return (
    <DetailLayout
      title="로그인"
      onBack={onBack}
      surface="surface"
      mainClassName="flex flex-col items-center justify-center gap-hm-40 p-hm-20"
      notice={
        <MockNotice message={message}>
          {import.meta.env.DEV && (
            <AppLink
              className="hm-focus-ring rounded-hm-5 underline underline-offset-4"
              to={paths.components}
            >
              컴포넌트 보기
            </AppLink>
          )}
        </MockNotice>
      }
    >
      {(reason === "signed-out" || reason === "expired") && (
        <Notice
          role="status"
          title={
            reason === "expired" ? "다시 로그인해 주세요" : "로그아웃했어요"
          }
          body={
            isMockPreviewEnabled
              ? "화면 확인용 Mock 결과예요. 실제 로그인 상태는 변경하지 않았어요."
              : reason === "expired"
                ? "로그인 시간이 만료되었어요. 저장하지 않은 내용은 다시 로그인한 뒤 입력해 주세요."
                : "다시 로그인하면 참여 중인 공간을 확인할 수 있어요."
          }
        />
      )}
      <div className="flex w-full flex-col items-center gap-hm-16 text-center">
        <BrandSymbol
          size="login"
          decorative
        />
        <h1 className="text-hm-title-page">한마음에 로그인</h1>
        <p className="text-hm-body-default text-hm-text-secondary">
          Google 또는 카카오 계정으로
          <br />
          간편하게 시작해요
        </p>
      </div>
      <SocialLoginOptions
        disabled={
          isMockPreviewEnabled ? !enabled : session.status === "checking"
        }
        loadingProvider={isMockPreviewEnabled ? provider : oauth.provider}
        onLogin={
          isMockPreviewEnabled
            ? previewLogin
            : (value) => void oauth.start(value)
        }
      />
      {!isMockPreviewEnabled && oauth.error && (
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
