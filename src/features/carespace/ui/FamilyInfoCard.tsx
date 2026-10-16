import type { ReactNode } from "react";
export function FamilyInfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-hm-8 rounded-hm-16 bg-hm-bg-surface p-hm-20 wrap-anywhere">
      <h2 className="text-hm-body-small text-hm-text-secondary">{title}</h2>
      <div className="text-hm-body-default">{children}</div>
    </section>
  );
}
