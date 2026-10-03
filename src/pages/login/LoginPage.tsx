import { Header } from "@/components/layout";
import { BrandSymbol } from "@/components/ui";
import {
  SocialLoginOptions,
  type SocialLoginOptionsProps,
} from "@/features/auth/ui/SocialLoginOptions";

type LoginPageProps = SocialLoginOptionsProps & { onBack: () => void };

export function LoginPage({ onBack, ...loginOptions }: LoginPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col bg-hm-bg-surface pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <Header
        variant="back"
        title="로그인"
        onBack={onBack}
      />
      <main className="flex flex-1 flex-col items-center justify-center gap-hm-40 p-hm-20">
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
        <SocialLoginOptions {...loginOptions} />
      </main>
    </div>
  );
}
