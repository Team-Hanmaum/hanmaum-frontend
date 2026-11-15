import { PageLayout } from "@/components/layout";
import { Notice } from "@/components/feedback";
import { BrandSymbol } from "@/components/ui";
import { SocialLoginOptions } from "@/features/auth/ui/SocialLoginOptions";
import { Navigate, useSearchParams } from "react-router";
import { useOAuthLogin } from "@/features/auth/model/useOAuthLogin";
import { useSession } from "@/features/auth/model/useSession";
import { paths } from "@/routes/paths";

export function LoginPage() {
  const oauth = useOAuthLogin();
  const session = useSession();
  const [params] = useSearchParams();
  const reason = params.get("reason");
  if (session.status === "authenticated")
    return (
      <Navigate
        to={paths.authCallback}
        replace
      />
    );
  return (
    <PageLayout mainClassName="flex flex-col gap-hm-24 px-hm-24 pt-hm-16 pb-hm-24">
      <div className="flex flex-1 flex-col items-center justify-center gap-hm-24 py-hm-24 text-center">
        <div className="flex flex-col items-center gap-hm-12">
          <BrandSymbol
            size="login"
            decorative
          />
          <h1 className="text-hm-title-page text-hm-text-brand">한마음</h1>
        </div>
        <p className="text-hm-title-hero">
          흩어진 소식은 하나로,
          <br />
          돌봄은 한마음으로
        </p>
      </div>
      <section
        aria-label="소셜 로그인"
        className="flex flex-col gap-hm-16"
      >
        {(reason === "signed-out" || reason === "expired") && (
          <Notice
            role="status"
            title={
              reason === "expired" ? "다시 로그인해 주세요" : "로그아웃했어요"
            }
            body={
              reason === "expired"
                ? "로그인 시간이 만료되었어요. 저장하지 않은 내용은 다시 로그인한 뒤 입력해 주세요."
                : "다시 로그인하면 참여 중인 공간을 확인할 수 있어요."
            }
          />
        )}
        {oauth.error && (
          <Notice
            tone="error"
            role="alert"
            title="로그인 시작 실패"
            body={oauth.error}
          />
        )}
        <SocialLoginOptions
          disabled={session.status === "checking"}
          loadingProvider={oauth.provider}
          onLogin={(value) => void oauth.start(value)}
        />
      </section>
    </PageLayout>
  );
}
