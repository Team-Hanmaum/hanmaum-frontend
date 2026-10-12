import type { ReactNode } from "react";
import { SocialLoginButton, type SocialProvider } from "@/components/ui";

export type SocialLoginOptionsProps = {
  disabled?: boolean;
  loadingProvider?: SocialProvider | null;
  onLogin: (provider: SocialProvider) => void;
  order?: readonly SocialProvider[];
  helper?: ReactNode;
  helperAlign?: "left" | "center";
};

export function SocialLoginOptions({
  disabled = false,
  loadingProvider,
  onLogin,
  order = ["kakao", "google"],
  helper = "처음 로그인하면 한마음 계정이 만들어져요.",
  helperAlign = "center",
}: SocialLoginOptionsProps) {
  return (
    <div className="flex w-full flex-col gap-hm-12">
      {order.map((provider) => (
        <SocialLoginButton
          key={provider}
          provider={provider}
          loading={loadingProvider === provider}
          disabled={
            disabled || Boolean(loadingProvider && loadingProvider !== provider)
          }
          onClick={() => onLogin(provider)}
        />
      ))}
      <p
        className={`text-hm-caption-default text-hm-text-secondary ${helperAlign === "center" ? "text-center" : "text-left"}`}
      >
        {helper}
      </p>
    </div>
  );
}
