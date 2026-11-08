import { Badge } from "@/components/ui";
import { Notice } from "./Notice";

// 예시 처리 후 실제 API 화면으로 복귀한 경우에도 결과의 범위를 표시한다.
export function ExampleResultNotice({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section
      className="flex flex-col gap-hm-8"
      aria-label="예시 처리 결과"
    >
      <Badge
        label="예시 결과"
        tone="neutral"
        className="self-start"
      />
      <Notice
        role="status"
        title={title}
        body={`${body} 실제 계정·공간 정보는 바뀌지 않았어요.`}
      />
    </section>
  );
}
