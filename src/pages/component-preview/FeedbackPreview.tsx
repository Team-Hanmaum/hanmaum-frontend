import { useEffect, useRef, useState } from "react";
import {
  Notice,
  EmptyState,
  ErrorState,
  LoadingState,
  ConfirmDialog,
  BottomSheet,
} from "@/components/feedback";
import { Button, SelectionRow } from "@/components/ui";
import { PreviewExample as Example } from "./PreviewExample";
export function FeedbackPreview({
  onAction,
}: {
  onAction: (message: string) => void;
}) {
  const [dialog, setDialog] = useState<"default" | "destructive" | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sheet, setSheet] = useState(false);
  const [person, setPerson] = useState("one");
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );
  function confirm() {
    if (timer.current !== null) return;
    setBusy(true);
    onAction("Mock · 확인 콜백 전달 · 실제 저장·삭제 없음");
    timer.current = setTimeout(() => {
      timer.current = null;
      setBusy(false);
      setDialog(null);
    }, 1000);
  }
  return (
    <section
      id="feedback"
      aria-labelledby="feedback-heading"
      className="flex flex-col gap-hm-16"
    >
      <h2
        id="feedback-heading"
        className="text-hm-heading-section"
      >
        안내·빈 상태·오류·로딩·오버레이
      </h2>
      <div className="grid gap-hm-16 md:grid-cols-2 xl:grid-cols-3">
        {(["info", "neutral", "error"] as const).map((tone) => (
          <Example
            key={tone}
            title={`Notice · ${tone}`}
          >
            <Notice
              tone={tone}
              title="확인이 필요해요"
              body="내용을 확인한 뒤 다시 진행해 주세요."
            />
            <Notice
              tone={tone}
              title="행동이 있는 안내"
              body="안내 동작을 확인하는 예시입니다."
              action={{
                label: "자세히 보기",
                onClick: () => onAction(`${tone} 안내 행동 확인`),
              }}
            />
          </Example>
        ))}
        <Example title="EmptyState · 행동 있음 / 없음">
          <EmptyState
            title="아직 남긴 소식이 없어요"
            body={"가족에게 전할 돌봄 소식을\n편하게 남겨 보세요."}
            action={{
              label: "소식 남기기",
              onClick: () => onAction("빈 상태 행동 확인"),
            }}
          />
          <EmptyState
            title="표시할 항목이 없어요"
            body="행동 없는 빈 상태 예시"
            icon="care-brand"
          />
        </Example>
        {(["load-error", "offline", "no-permission"] as const).map((reason) => (
          <Example
            key={reason}
            title={`ErrorState · ${reason}`}
          >
            <ErrorState
              reason={reason}
              onAction={() =>
                onAction(`${reason} 후속 행동 확인 · API 호출 없음`)
              }
            />
          </Example>
        ))}
        <Example title="LoadingState · 최초 / 추가">
          <LoadingState />
          <LoadingState
            variant="more"
            label="다음 항목을 불러오는 중이에요"
          />
        </Example>
        <Example title="ConfirmDialog · 기본 / 삭제">
          <p className="text-hm-body-small text-hm-text-secondary">
            취소에 최초 포커스. Esc로 닫기, 호출 버튼으로 포커스 복귀. 확인 후
            1초 동안 닫기·중복 클릭 차단.
          </p>
          <Button onClick={() => setDialog("default")}>일반 확인 열기</Button>
          <Button
            variant="destructive"
            onClick={() => setDialog("destructive")}
          >
            삭제 확인 열기
          </Button>
        </Example>
        <Example title="BottomSheet · 선택 조합">
          <Button
            variant="outline"
            onClick={() => setSheet(true)}
          >
            담당자 선택 열기
          </Button>
          <p className="text-hm-body-small text-hm-text-secondary">
            선택값: {person} · Mock
          </p>
        </Example>
      </div>
      <ConfirmDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        intent={dialog ?? "default"}
        title="계속 진행할까요?"
        body="변경할 내용을 확인한 뒤 진행해 주세요."
        busy={busy}
        onConfirm={confirm}
      />
      <BottomSheet
        open={sheet}
        onOpenChange={setSheet}
        title="담당자 선택"
        description="누가 함께할지 선택해 주세요."
        footer={
          <Button
            onClick={() => {
              setSheet(false);
              onAction("Mock · 담당자 선택 동작 확인 · 실제 저장 없음");
            }}
          >
            선택 완료
          </Button>
        }
      >
        <fieldset className="flex min-w-0 flex-col gap-hm-16">
          <legend className="sr-only">담당자</legend>
          {[
            { value: "one", label: "수진", description: "나 · 소유자" },
            { value: "two", label: "민수", description: "구성원" },
            {
              value: "none",
              label: "담당 미정",
              description: "나중에 정할 수 있어요",
            },
          ].map((item) => (
            <SelectionRow
              key={item.value}
              control="radio"
              name="sheet-assignee"
              value={item.value}
              label={item.label}
              description={item.description}
              checked={person === item.value}
              onChange={() => setPerson(item.value)}
            />
          ))}
        </fieldset>
      </BottomSheet>
    </section>
  );
}
