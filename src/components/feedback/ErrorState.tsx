import { Button, Icon, type IconName } from "@/components/ui";
export type ErrorReason = "load-error" | "offline" | "no-permission";
const reasons: Record<
  ErrorReason,
  { icon: IconName; title: string; body: string; action: string }
> = {
  "load-error": {
    icon: "alert-error",
    title: "내용을 불러오지 못했어요",
    body: "잠시 후 다시 불러와 주세요.",
    action: "다시 불러오기",
  },
  offline: {
    icon: "refresh-error",
    title: "인터넷 연결을 확인해 주세요",
    body: "연결되면 내용을 다시 불러올 수 있어요.",
    action: "다시 연결하기",
  },
  "no-permission": {
    icon: "lock-secondary",
    title: "이 공간에 접근할 수 없어요",
    body: "참여 중인 돌봄 공간을 확인해 주세요.",
    action: "돌봄 공간 확인",
  },
};
export type ErrorStateProps = {
  reason: ErrorReason;
  title?: string;
  body?: string;
  onAction?: () => void;
  actionLabel?: string;
  loading?: boolean;
  className?: string;
};
export function ErrorState({
  reason,
  title,
  body,
  onAction,
  actionLabel,
  loading = false,
  className = "",
}: ErrorStateProps) {
  const content = reasons[reason];
  return (
    <div
      className={`flex w-full min-w-0 flex-col items-start gap-hm-16 rounded-hm-14 bg-hm-bg-surface p-hm-24 wrap-anywhere ${className}`}
    >
      <Icon name={content.icon} />
      <h3 className="w-full text-hm-heading-section">
        {title ?? content.title}
      </h3>
      <p className="w-full text-hm-body-default whitespace-pre-wrap text-hm-text-secondary">
        {body ?? content.body}
      </p>
      {onAction && (
        <Button
          className="w-full"
          variant="outline"
          onClick={onAction}
          loading={loading}
        >
          {actionLabel ?? content.action}
        </Button>
      )}
    </div>
  );
}
