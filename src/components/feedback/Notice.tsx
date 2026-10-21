import type { ComponentPropsWithoutRef } from "react";
import { Icon, TextAction, type IconName } from "@/components/ui";
export type NoticeProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "title"
> & {
  title: string;
  body: string;
  tone?: "info" | "neutral" | "error";
  /** 종료 효과가 필요한 안내는 조건부 마운트 대신 visible로 표시한다. */
  visible?: boolean;
  action?: { label: string; onClick: () => void; disabled?: boolean };
};
const tones: Record<
  NonNullable<NoticeProps["tone"]>,
  { classes: string; title: string; icon: IconName }
> = {
  info: {
    classes: "bg-hm-bg-brand-subtle text-hm-text-brand",
    title: "text-hm-text-brand",
    icon: "info-brand",
  },
  neutral: {
    classes: "bg-hm-bg-subtle text-hm-text-secondary",
    title: "text-hm-text-primary",
    icon: "info-secondary",
  },
  error: {
    classes: "bg-hm-feedback-error-bg text-hm-feedback-error-text",
    title: "text-hm-feedback-error-text",
    icon: "alert-error",
  },
};
export function Notice({
  title,
  body,
  tone = "info",
  visible = true,
  action,
  className = "",
  ...props
}: NoticeProps) {
  return (
    <div
      {...props}
      hidden={!visible}
      aria-hidden={!visible || undefined}
      inert={!visible}
      className={`hm-notice flex w-full min-w-0 flex-col gap-hm-8 rounded-hm-14 p-hm-16 wrap-anywhere ${tones[tone].classes} ${className}`}
    >
      <div className="flex items-center gap-hm-8">
        <Icon name={tones[tone].icon} />
        <p
          className={`min-w-0 flex-1 text-hm-body-emphasis ${tones[tone].title}`}
        >
          {title}
        </p>
      </div>
      <p className="text-hm-body-small whitespace-pre-wrap">{body}</p>
      {action && (
        <TextAction
          onClick={action.onClick}
          disabled={action.disabled}
          tone={tone === "error" ? "danger" : "default"}
          className="w-full"
        >
          {action.label}
        </TextAction>
      )}
    </div>
  );
}
