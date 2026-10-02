import type { ComponentPropsWithRef } from "react";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";
import "./button.css";

export type SocialProvider = "google" | "kakao";
export type SocialLoginButtonProps = Omit<
  ComponentPropsWithRef<"button">,
  "children"
> & {
  provider: SocialProvider;
  label?: string;
  loading?: boolean;
};

const labels = {
  google: "Google로 계속하기",
  kakao: "카카오로 계속하기",
};

export function SocialLoginButton({
  provider,
  label = labels[provider],
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...props
}: SocialLoginButtonProps) {
  const busy = loading && !disabled;

  return (
    <button
      {...props}
      type={type}
      className={`hm-social-button hm-focus-ring ${className}`}
      data-provider={provider}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
    >
      {busy ? <Spinner tone="secondary" /> : <Icon name={provider} />}
      <span className="min-w-0">
        {label}
        {busy && <span className="sr-only"> · 처리 중</span>}
      </span>
    </button>
  );
}
