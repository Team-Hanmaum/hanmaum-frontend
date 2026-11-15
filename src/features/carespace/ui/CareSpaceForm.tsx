import { useRef } from "react";
import { Button, Field } from "@/components/ui";
import { Notice } from "@/components/feedback";

export type CareSpaceFormFailure = { title: string; body: string };

const defaultFailure: CareSpaceFormFailure = {
  title: "공간을 만들지 못했어요",
  body: "입력한 내용은 그대로예요.\n연결 상태를 확인한 뒤 다시 시도해 주세요.",
};

const quickInputButtonClass =
  "min-h-hm-touch-min rounded-hm-full border border-transparent px-hm-16 py-hm-8";

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
  failed?: boolean | CareSpaceFormFailure;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const name = value.trim();
  const failure = failed === true ? defaultFailure : failed || undefined;
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
        <h1 className="text-hm-title-page">부모님 호칭을 정해요</h1>
        <p className="text-hm-body-default break-keep text-hm-text-secondary">
          한 공간에 부모님 한 분의 돌봄을 기록해요.
        </p>
      </div>
      {failure && (
        <Notice
          role="alert"
          tone="error"
          title={failure.title}
          body={failure.body}
        />
      )}
      <div className="flex flex-col gap-hm-12">
        <Field
          ref={input}
          label="이름 또는 호칭"
          placeholder="예: 엄마"
          helper={name ? `공간 이름: ${name}의 돌봄` : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          error={error}
          disabled={disabled}
          autoComplete="off"
        />
        <div
          className="flex flex-wrap gap-hm-8"
          role="group"
          aria-label="호칭 빠른 입력"
        >
          {["엄마", "아빠"].map((label) => (
            <Button
              key={label}
              variant={name === label ? "secondary" : "outline"}
              className={quickInputButtonClass}
              aria-pressed={name === label}
              disabled={disabled}
              onClick={() => onChange(label)}
            >
              {label}
            </Button>
          ))}
          <Button
            variant="outline"
            className={quickInputButtonClass}
            disabled={disabled}
            onClick={() => {
              input.current?.focus();
              input.current?.select();
            }}
          >
            직접 입력
          </Button>
        </div>
      </div>
      <p className="text-hm-body-small break-keep text-hm-text-secondary">
        공간을 만들면 소유자가 되고, 가족을 초대할 수 있어요.
      </p>
    </form>
  );
}
