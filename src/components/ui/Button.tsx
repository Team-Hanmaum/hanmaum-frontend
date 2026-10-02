import type { ComponentPropsWithRef, ReactNode } from "react";
import { Spinner } from "./Spinner";
import "./button.css";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: "primary" | "secondary" | "outline" | "destructive";
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  loading = false,
  loadingLabel = "처리 중",
  disabled = false,
  icon,
  children,
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  const busy = loading && !disabled;

  return (
    <button
      {...props}
      type={type}
      className={`hm-button hm-focus-ring ${className}`}
      data-variant={variant}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
    >
      {busy ? (
        <Spinner
          tone={
            variant === "primary" || variant === "destructive"
              ? "inverse"
              : "brand"
          }
        />
      ) : icon ? (
        <span
          className="inline-flex shrink-0"
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        {children}
        {busy && <span className="sr-only"> · {loadingLabel}</span>}
      </span>
    </button>
  );
}
