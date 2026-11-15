import { TextAction } from "@/components/ui";

export function PageTitleWithAction({
  title,
  action,
}: {
  title: string;
  action: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between gap-hm-12">
      <h1 className="text-hm-title-page">{title}</h1>
      <TextAction
        className="shrink-0 rounded-hm-full border border-hm-action-primary/25 bg-hm-bg-brand-subtle px-hm-12 font-bold text-hm-text-brand hover:border-hm-action-primary/50"
        onClick={action.onClick}
      >
        {action.label}
      </TextAction>
    </div>
  );
}
