import type { ComponentPropsWithoutRef } from "react";
export type BadgeProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  label: string;
  tone?: "neutral" | "brand" | "error";
};
const tones = {
  neutral: "bg-hm-bg-subtle text-hm-text-secondary",
  brand: "bg-hm-bg-brand-subtle text-hm-text-brand",
  error: "bg-hm-feedback-error-bg text-hm-feedback-error-text",
};
export function Badge({
  label,
  tone = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={`inline-flex max-w-full rounded-hm-6 px-hm-8 py-hm-4 text-hm-label-badge wrap-anywhere ${tones[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
