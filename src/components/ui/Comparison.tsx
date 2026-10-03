import { Icon } from "./Icon";
export type ComparisonProps = {
  beforeLabel: string;
  beforeValue: string;
  afterLabel: string;
  afterValue: string;
  className?: string;
};
export function Comparison({
  beforeLabel,
  beforeValue,
  afterLabel,
  afterValue,
  className = "",
}: ComparisonProps) {
  return (
    <div className={`flex w-full items-center gap-hm-12 ${className}`}>
      <div className="flex min-w-0 flex-1 flex-col gap-hm-4 rounded-hm-14 bg-hm-bg-subtle p-hm-12 wrap-anywhere">
        <p className="text-hm-caption-default text-hm-text-secondary">
          {beforeLabel}
        </p>
        <p className="text-hm-body-emphasis whitespace-pre-wrap">
          {beforeValue}
        </p>
      </div>
      <Icon name="arrow-right-secondary" />
      <div className="flex min-w-0 flex-1 flex-col gap-hm-4 rounded-hm-14 bg-hm-bg-brand-subtle p-hm-12 wrap-anywhere text-hm-text-brand">
        <p className="text-hm-caption-default">{afterLabel}</p>
        <p className="text-hm-body-emphasis whitespace-pre-wrap">
          {afterValue}
        </p>
      </div>
    </div>
  );
}
