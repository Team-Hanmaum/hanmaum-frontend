import { DetailLayout } from "@/components/layout";
import { MockNotice } from "@/components/feedback/MockNotice";
import { Notice } from "@/components/feedback";
import { BrandSymbol } from "@/components/ui";
import { SocialLoginOptions } from "@/features/auth/ui/SocialLoginOptions";
import { Link, useSearchParams } from "react-router";
import { paths } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useLoginPreview } from "./useLoginPreview";

export function LoginPage() {
  const onBack = useBackNavigation(paths.landing);
  const { enabled, provider, message, previewLogin } = useLoginPreview();
  const [params] = useSearchParams();
  const reason = params.get("reason");
  return (
    <DetailLayout
      title="로그인"
      onBack={onBack}
      surface="surface"
      mainClassName="flex flex-col items-center justify-center gap-hm-40 p-hm-20"
      notice={
        <MockNotice message={message}>
          {import.meta.env.DEV && (
            <Link
              className="hm-focus-ring rounded-hm-5 underline underline-offset-4"
              to={paths.components}
            >
              컴포넌트 보기
            </Link>
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
          body="화면 확인용 Mock 결과예요. 실제 로그인 상태는 변경하지 않았어요."
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
        disabled={!enabled}
        loadingProvider={provider}
        onLogin={previewLogin}
      />
    </DetailLayout>
  );
}
