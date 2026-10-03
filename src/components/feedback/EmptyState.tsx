import { Button, Icon, type IconName } from "@/components/ui";
export type EmptyStateProps = {
  title: string;
  body: string;
  icon?: IconName;
  action?: { label: string; onClick: () => void; disabled?: boolean };
  className?: string;
};
export function EmptyState({
  title,
  body,
  icon = "news-brand",
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex w-full min-w-0 flex-col items-center gap-hm-16 rounded-hm-14 bg-hm-bg-surface p-hm-24 text-center wrap-anywhere ${className}`}
    >
      <span className="inline-flex size-hm-control items-center justify-center rounded-hm-full bg-hm-bg-brand-subtle">
        <Icon name={icon} />
      </span>
      <h3 className="w-full text-hm-heading-section">{title}</h3>
      <p className="w-full text-hm-body-default whitespace-pre-wrap text-hm-text-secondary">
        {body}
      </p>
      {action && (
        <Button
          className="w-full"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
