import { Badge, TextAction } from "@/components/ui";
import { useExampleContext } from "./exampleContext";

export function ExampleDisclosure({
  result = false,
  description = "입력과 처리 결과는 화면 확인용이에요. 실제 계정·공간·홈 데이터에는 반영되지 않아요.",
}: {
  result?: boolean;
  description?: string;
}) {
  const example = useExampleContext();
  if (!example) return null;
  return (
    <aside
      aria-label="예시 화면 안내"
      className="flex flex-col gap-hm-8"
    >
      <div className="flex flex-wrap items-center gap-hm-8">
        <Badge
          label={result ? "예시 결과" : "예시 데이터"}
          tone="neutral"
        />
        <span className="text-hm-caption-default text-hm-text-secondary">
          API 미연동
        </span>
        <TextAction onClick={example.onReset}>예시 초기화</TextAction>
      </div>
      <p className="text-hm-caption-default text-hm-text-secondary">
        {description}
      </p>
    </aside>
  );
}
