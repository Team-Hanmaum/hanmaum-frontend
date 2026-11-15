import { useId, type ReactNode } from "react";
import { TabItem } from "./TabItem";

const tabStyles = {
  default: { list: "gap-hm-8", item: "flex-1" },
  underline: {
    list: "border-b border-hm-divider-default",
    item: "-mb-px flex-1 rounded-none border-0 border-b-2 border-transparent bg-transparent px-hm-4 data-[selected=true]:border-hm-action-primary data-[selected=true]:bg-transparent data-[selected=true]:font-bold",
  },
  pill: {
    list: "gap-hm-8",
    item: "rounded-hm-full data-[selected=true]:text-hm-body-small data-[selected=true]:font-bold",
  },
} as const;

export type TabsProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: readonly {
    value: string;
    label: string;
    content: ReactNode;
    disabled?: boolean;
  }[];
  className?: string;
  tabClassName?: string;
  variant?: keyof typeof tabStyles;
};
export function Tabs({
  label,
  value,
  onValueChange,
  items,
  className = "",
  tabClassName = "",
  variant = "default",
}: TabsProps) {
  const id = useId();
  const style = tabStyles[variant];
  const active =
    items.find((item) => item.value === value && !item.disabled)?.value ??
    items.find((item) => !item.disabled)?.value;
  return (
    <div className={`flex min-w-0 flex-col gap-hm-16 ${className}`}>
      <div
        role="tablist"
        aria-label={label}
        className={`flex flex-wrap ${style.list}`}
      >
        {items.map((item, index) => (
          <TabItem
            key={item.value}
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            selected={active === item.value}
            disabled={item.disabled}
            tabIndex={active === item.value ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const enabled = items.filter((candidate) => !candidate.disabled);
              const current = enabled.findIndex(
                (candidate) => candidate.value === item.value,
              );
              const target =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? enabled.length - 1
                    : (current +
                        (event.key === "ArrowRight" ? 1 : -1) +
                        enabled.length) %
                      enabled.length;
              const next = enabled[target];
              if (!next) return;
              const nextIndex = items.indexOf(next);
              document.getElementById(`${id}-tab-${nextIndex}`)?.focus();
              onValueChange(next.value);
            }}
            className={`min-w-0 ${style.item} ${tabClassName}`}
          >
            {item.label}
          </TabItem>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={active !== item.value}
          tabIndex={0}
          className="min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hm-border-focus"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
