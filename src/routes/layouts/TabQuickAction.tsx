import { Button, Icon } from "@/components/ui";

export function TabQuickAction({
  label,
  accessibleLabel,
  onClick,
}: {
  label: string;
  accessibleLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-end px-hm-20 pt-hm-4 pb-hm-8">
      <Button
        aria-label={accessibleLabel}
        icon={<Icon name="plus-inverse" />}
        className="pointer-events-auto min-h-hm-touch-min max-w-full rounded-hm-full px-hm-16 py-hm-8 shadow-sm"
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
}
