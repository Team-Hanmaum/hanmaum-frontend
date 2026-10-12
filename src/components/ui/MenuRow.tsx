import type { ComponentPropsWithRef } from "react";
import { Icon, type IconName } from "./Icon";
import "./focus-ring.css";
export type MenuRowProps = Omit<
  ComponentPropsWithRef<"button">,
  "children" | "title"
> & {
  title: string;
  description?: string;
  icon?: IconName;
  tone?: "default" | "danger" | "brand";
};
export function MenuRow({
  title,
  description,
  tone = "default",
  icon = tone === "danger" ? "person-error" : "person-brand",
  className = "",
  type = "button",
  ...props
}: MenuRowProps) {
  return (
    <button
      {...props}
      type={type}
      className={`hm-focus-ring flex min-h-18 w-full items-center gap-hm-12 rounded-hm-12 p-hm-16 text-left disabled:cursor-not-allowed disabled:opacity-40 ${tone === "brand" ? "bg-hm-bg-brand-subtle" : "bg-hm-bg-surface"} ${className}`}
    >
      <Icon name={icon} />
      <span className="flex min-w-0 flex-1 flex-col gap-hm-4 wrap-anywhere">
        <span
          className={`text-hm-body-emphasis ${tone === "danger" ? "text-hm-feedback-error-text" : tone === "brand" ? "text-hm-text-brand" : "text-hm-text-primary"}`}
        >
          {title}
        </span>
        {description && (
          <span className="text-hm-caption-default text-hm-text-secondary">
            {description}
          </span>
        )}
      </span>
      <Icon
        name={
          tone === "brand" ? "chevron-right-brand" : "chevron-right-secondary"
        }
      />
    </button>
  );
}
