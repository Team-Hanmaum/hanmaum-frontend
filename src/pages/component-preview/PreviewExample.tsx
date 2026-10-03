import type { ReactNode } from "react";
export function PreviewExample({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-hm-12 rounded-hm-14 border border-hm-border-default bg-hm-bg-page p-hm-20">
      <h3 className="text-hm-body-emphasis">{title}</h3>
      {children}
    </div>
  );
}
