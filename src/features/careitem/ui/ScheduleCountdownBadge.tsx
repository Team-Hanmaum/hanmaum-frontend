import { Badge } from "@/components/ui";

export function ScheduleCountdownBadge({ daysUntil }: { daysUntil?: number }) {
  if (daysUntil === undefined) return null;

  return (
    <Badge
      label={daysUntil === 0 ? "D-day" : `D-${daysUntil}`}
      tone="brand"
      className="shrink-0 whitespace-nowrap tabular-nums"
    />
  );
}
