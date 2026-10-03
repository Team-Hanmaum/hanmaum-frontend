import { SocialLoginButton, type SocialProvider } from "@/components/ui";

export type SocialLoginOptionsProps = {
  loadingProvider?: SocialProvider | null;
  onLogin: (provider: SocialProvider) => void;
};

export function SocialLoginOptions({
  loadingProvider,
  onLogin,
}: SocialLoginOptionsProps) {
  return (
    <div className="flex w-full flex-col gap-hm-12">
      {(["kakao", "google"] as const).map((provider) => (
        <SocialLoginButton
          key={provider}
          provider={provider}
          loading={loadingProvider === provider}
          disabled={Boolean(loadingProvider && loadingProvider !== provider)}
          onClick={() => onLogin(provider)}
        />
      ))}
      <p className="text-center text-hm-caption-default text-hm-text-secondary">
        처음 로그인하면 한마음 계정이 만들어져요.
      </p>
    </div>
  );
}
