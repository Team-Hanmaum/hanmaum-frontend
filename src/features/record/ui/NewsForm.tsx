import { Notice } from "@/components/feedback";
import { Field, Icon } from "@/components/ui";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";

const defaultFailure = {
  title: "소식을 등록하지 못했어요",
  body: "작성한 내용은 그대로 있어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
};

export function NewsForm({
  id,
  space,
  body,
  onChange,
  onSubmit,
  error,
  failed,
  disabled,
}: {
  id: string;
  space: Pick<CareSpaceView, "subjectLabel">;
  body: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string;
  failed: boolean | { title: string; body: string };
  disabled: boolean;
}) {
  const failure = failed === true ? defaultFailure : failed || undefined;
  return (
    <form
      id={id}
      className="flex flex-col gap-hm-24"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {failure && (
        <Notice
          tone="error"
          role="alert"
          title={failure.title}
          body={failure.body}
        />
      )}
      <div className="flex flex-col gap-hm-8">
        <h1 className="text-hm-title-page">어떤 소식이 있나요?</h1>
        <p className="flex items-center gap-hm-8 text-hm-body-small wrap-anywhere text-hm-text-secondary">
          <Icon name="family-secondary" />
          <span>{careSpaceName(space)}에 남기는 소식</span>
        </p>
      </div>
      <Field
        multiline
        label="소식 내용"
        rows={5}
        aria-describedby={`${id}-sharing-note`}
        value={body}
        onChange={(event) => onChange(event.target.value)}
        placeholder="예: 다음 진료가 20일 오후 2시로 바뀌었어요."
        error={error}
        disabled={disabled}
        className="[&_textarea]:resize-none [&_textarea]:leading-[var(--text-hm-body-reading--line-height)] [&_textarea:enabled]:bg-hm-bg-surface [&_textarea:enabled:focus]:bg-hm-bg-brand-subtle"
      />
      <p
        id={`${id}-sharing-note`}
        className="text-hm-body-small text-hm-text-secondary"
      >
        이 공간의 가족이 소식을 함께 봐요. 일정·할 일 제안은 검토 후 반영돼요.
      </p>
    </form>
  );
}
