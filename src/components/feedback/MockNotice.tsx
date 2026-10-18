import type { ReactNode } from "react";
import { useQaMode } from "@/lib/useQaMode";

export function MockNotice({
  message,
  children,
}: {
  message: string;
  children?: ReactNode;
}) {
  const { enabled } = useQaMode();
  return (
    <aside
      aria-label="Mock 안내"
      className="flex flex-wrap items-center justify-center gap-hm-8 bg-hm-bg-brand-subtle px-hm-20 py-hm-8 text-hm-caption-default text-hm-text-brand"
    >
      <p
        role="status"
        aria-atomic="true"
      >
        Mock · {enabled ? message : "실제 로그인·저장 없음"}
      </p>
      {enabled && children}
    </aside>
  );
}
