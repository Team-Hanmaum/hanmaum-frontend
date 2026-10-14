import { useState } from "react";
import { Notice } from "@/components/feedback";
import { Button, TextAction } from "@/components/ui";
import { WheelPicker } from "@/components/ui/WheelPicker";
import { formatCareTime } from "@/features/careitem/model/careItemFields";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";

const periods = [
  { value: "0", label: "오전" },
  { value: "12", label: "오후" },
];
const hours = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}));
const minutes = Array.from({ length: 60 }, (_, index) => ({
  value: String(index),
  label: String(index).padStart(2, "0"),
}));

function initialTime(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return {};
  const [hour, minute] = value.split(":").map(Number);
  return {
    period: String(hour >= 12 ? 12 : 0),
    hour: String(hour % 12 || 12),
    minute: String(minute),
  };
}

export function TimeSelectionPage({
  spaceId,
  initialValue,
  onConfirm,
  onBack,
}: {
  spaceId: string;
  initialValue: string;
  onConfirm: (value: string) => void;
  onBack: () => void;
}) {
  const [parts, setParts] = useState<
    Partial<Record<"period" | "hour" | "minute", string>>
  >(() => initialTime(initialValue));
  const [scrolling, setScrolling] = useState({
    period: false,
    hour: false,
    minute: false,
  });
  const moving = Object.values(scrolling).some(Boolean);
  const complete =
    parts.period !== undefined &&
    parts.hour !== undefined &&
    parts.minute !== undefined;
  const value = complete
    ? `${String((Number(parts.hour) % 12) + Number(parts.period)).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`
    : "";
  return (
    <ProposalPageLayout
      title="시간 선택"
      spaceId={spaceId}
      onBack={onBack}
      actions={
        <>
          <Button
            disabled={!complete || moving}
            onClick={() => onConfirm(value)}
          >
            이 시간으로 선택
          </Button>
          <TextAction onClick={onBack}>돌아가기</TextAction>
        </>
      }
    >
      <h1 className="text-hm-title-page">몇 시인가요?</h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        위아래로 밀거나 값을 눌러 선택해 주세요.
      </p>
      <div className="grid grid-cols-3 items-end gap-hm-12">
        <WheelPicker
          label="오전·오후"
          options={periods}
          value={parts.period}
          onScrollingChange={(period) =>
            setScrolling((previous) => ({ ...previous, period }))
          }
          onChange={(period) =>
            setParts((previous) => ({ ...previous, period }))
          }
        />
        <WheelPicker
          label="시"
          options={hours}
          value={parts.hour}
          onScrollingChange={(hour) =>
            setScrolling((previous) => ({ ...previous, hour }))
          }
          onChange={(hour) => setParts((previous) => ({ ...previous, hour }))}
          loop
        />
        <WheelPicker
          label="분"
          options={minutes}
          value={parts.minute}
          onScrollingChange={(minute) =>
            setScrolling((previous) => ({ ...previous, minute }))
          }
          onChange={(minute) =>
            setParts((previous) => ({ ...previous, minute }))
          }
          loop
        />
      </div>
      <Notice
        tone="neutral"
        title={complete ? formatCareTime(value) : "시간을 선택해 주세요"}
        body={
          complete
            ? "선택한 시간이 입력 화면에 들어가요."
            : "오전·오후, 시, 분을 모두 선택해 주세요."
        }
        role="status"
        aria-live="polite"
      />
    </ProposalPageLayout>
  );
}
