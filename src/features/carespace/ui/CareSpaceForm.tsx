import { useRef } from "react";
import { Button, Field } from "@/components/ui";
import { Notice } from "@/components/feedback";

export function CareSpaceForm({
  id,
  value,
  onChange,
  onSubmit,
  error,
  failed,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string;
  failed?: boolean;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <form
      id={id}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-hm-24"
    >
      <div className="flex flex-col gap-hm-8">
        <h1 className="text-hm-title-page">
          부모님을
          <br />
          어떻게 부를까요?
        </h1>
        <p className="text-hm-body-default text-hm-text-secondary">
          한 공간에서 부모님 한 분의 돌봄을
          <br />
          함께 기록해요.
        </p>
      </div>
      {failed && (
        <Notice
          role="alert"
          tone="error"
          title="공간을 만들지 못했어요"
          body={
            "입력한 내용은 그대로예요.\n연결 상태를 확인한 뒤 다시 시도해 주세요."
          }
        />
      )}
      <Field
        ref={input}
        label="공간에서 사용할 이름 또는 호칭"
        placeholder="예: 엄마"
        helper="가족에게 익숙한 호칭을 적어주세요."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={error}
        disabled={disabled}
        autoComplete="off"
      />
      <div
        className="grid grid-cols-3 gap-hm-8"
        role="group"
        aria-label="호칭 빠른 입력"
      >
        {["엄마", "아빠"].map((label) => (
          <Button
            key={label}
            variant={value === label ? "secondary" : "outline"}
            aria-pressed={value === label}
            disabled={disabled}
            onClick={() => onChange(label)}
          >
            {label}
          </Button>
        ))}
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => {
            onChange("");
            input.current?.focus();
          }}
        >
          직접 입력
        </Button>
      </div>
      <div className="flex flex-col gap-hm-8 rounded-hm-16 bg-hm-bg-brand-subtle p-hm-20 wrap-anywhere">
        <p className="text-hm-caption-default text-hm-text-secondary">
          이렇게 표시돼요
        </p>
        <p className="text-hm-heading-section text-hm-text-brand">
          {value.trim()
            ? `${value.trim()}의 돌봄`
            : "이름 또는 호칭을 입력해 주세요"}
        </p>
      </div>
      <p className="text-hm-body-small text-hm-text-secondary">
        공간을 만든 내가 소유자가 돼요.
        <br />
        가족은 시작한 뒤에 초대해도 괜찮아요.
      </p>
    </form>
  );
}
