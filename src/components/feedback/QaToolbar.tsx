import { useQaMode } from "@/lib/useQaMode";
import { TextAction } from "@/components/ui/TextAction";

export function QaToolbar() {
  const { enabled, exit } = useQaMode();
  if (!enabled) return null;
  return (
    <aside
      aria-label="QA 도구"
      className="flex items-center justify-between gap-hm-12 bg-hm-bg-brand-subtle px-hm-20 text-hm-caption-default text-hm-text-brand"
    >
      <span>QA 모드</span>
      <TextAction onClick={exit}>QA 종료</TextAction>
    </aside>
  );
}
