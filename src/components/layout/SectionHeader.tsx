import type { ReactNode } from "react";
import { TextAction } from "@/components/ui";
export type SectionHeaderProps = {
  title: string;
  action?: { label: string; onClick: () => void; disabled?: boolean };
  headingLevel?: 2 | 3 | 4;
  id?: string;
  children?: ReactNode;
  className?: string;
};
export function SectionHeader({
  title,
  action,
  headingLevel = 2,
  id,
  children,
  className = "",
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div className={`flex w-full items-center gap-hm-12 ${className}`}>
      <Heading
        id={id}
        className="min-w-0 flex-1 text-hm-heading-section wrap-anywhere"
      >
        {title}
      </Heading>
      {action && (
        <TextAction
          onClick={action.onClick}
          disabled={action.disabled}
          className="min-w-22 shrink-0"
        >
          {action.label}
        </TextAction>
      )}
      {children}
    </div>
  );
}
