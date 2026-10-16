import type { ReactNode } from "react";

export function AccountInfoCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
      {title && <h2 className="text-hm-heading-section">{title}</h2>}
      {children}
    </section>
  );
}
