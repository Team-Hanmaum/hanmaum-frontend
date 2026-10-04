import type { ReactNode } from "react";

export function MockNotice({
  message,
  children,
}: {
  message: string;
  children?: ReactNode;
}) {
  return (
    <aside
      aria-label="Mock 안내"
      className="flex flex-wrap items-center justify-center gap-hm-8 bg-hm-bg-brand-subtle px-hm-20 py-hm-8 text-hm-caption-default text-hm-text-brand"
    >
      <p
        role="status"
        aria-atomic="true"
      >
        Mock · {message}
      </p>
      {children}
    </aside>
  );
}
