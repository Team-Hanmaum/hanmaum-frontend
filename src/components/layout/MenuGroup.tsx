import { useId } from "react";
import { MenuRow, type MenuRowProps } from "@/components/ui";

export function MenuGroup({
  title,
  items,
}: {
  title?: string;
  items: readonly MenuRowProps[];
}) {
  const headingId = useId();
  const rows = (
    <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
      {items.map(({ className = "", ...item }) => (
        <MenuRow
          key={item.title}
          {...item}
          className={`min-h-hm-touch-min rounded-none px-hm-16 py-hm-12 first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle focus-visible:z-10 ${className}`}
        />
      ))}
    </div>
  );
  if (!title) return rows;

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-hm-12"
    >
      <h2
        id={headingId}
        className="text-hm-heading-section"
      >
        {title}
      </h2>
      {rows}
    </section>
  );
}
