import { Spinner } from "@/components/ui";
export type LoadingStateProps = {
  variant?: "initial" | "more";
  label?: string;
  className?: string;
};
export function LoadingState({
  variant = "initial",
  label = "불러오는 중이에요",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`flex w-full min-w-0 flex-col gap-hm-16 ${className}`}>
      <div
        role="status"
        className="flex items-center justify-center gap-hm-8 text-hm-body-small text-hm-text-secondary"
      >
        <Spinner />
        <span className="min-w-0 wrap-anywhere">{label}</span>
      </div>
      {variant === "initial" &&
        [0, 1].map((index) => (
          <div
            key={index}
            aria-hidden="true"
            className="flex w-full flex-col gap-hm-12 rounded-hm-14 bg-hm-bg-surface p-hm-20"
          >
            <span className="h-4.5 w-22.5 max-w-full rounded-hm-6 bg-hm-bg-subtle" />
            <span className="h-6 w-62.5 max-w-full rounded-hm-6 bg-hm-bg-subtle" />
            <span className="h-4.5 w-45 max-w-full rounded-hm-6 bg-hm-bg-subtle" />
          </div>
        ))}
    </div>
  );
}
