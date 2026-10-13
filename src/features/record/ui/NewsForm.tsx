import { Notice } from "@/components/feedback";
import { Field, Icon } from "@/components/ui";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";

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
  space: CareSpaceView;
  body: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string;
  failed: boolean;
  disabled: boolean;
}) {
  return (
    <form
      id={id}
      className="flex flex-col gap-hm-24"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {failed && (
        <Notice
          tone="error"
          role="alert"
          title="소식을 등록하지 못했어요"
          body="작성한 내용은 그대로 있어요. 연결 상태를 확인한 뒤 다시 시도해 주세요."
        />
      )}
      <div className="flex flex-col gap-hm-12">
        <p className="text-hm-caption-default wrap-anywhere text-hm-text-brand">
          {careSpaceName(space)}
        </p>
        <h1 className="text-hm-title-page">어떤 소식이 있나요?</h1>
        <p className="text-hm-body-default text-hm-text-secondary">
          병원에서 들은 이야기나 오늘의 변화를
          <br />
          가족에게 편하게 남겨 주세요.
        </p>
      </div>
      <Field
        multiline
        label="소식 내용"
        value={body}
        onChange={(event) => onChange(event.target.value)}
        placeholder="예: 병원에서 재진 날짜가 바뀌었다고 연락이 왔어요."
        helper={
          body.trim()
            ? "여러 이야기를 한 번에 적어도 괜찮아요."
            : "내용을 입력하면 등록할 수 있어요."
        }
        error={error}
        disabled={disabled}
        className="[&_textarea]:leading-[var(--text-hm-body-reading--line-height)]"
      />
      <Notice
        title="일정·할 일도 함께 정리해요"
        body={"필요한 변경은 제안으로 정리해요.\n실제 정보는 검토 후 반영돼요."}
      />
      <p className="flex items-start gap-hm-8 text-hm-body-small text-hm-text-secondary">
        <Icon name="family-secondary" />
        등록한 소식은 이 공간의 가족이 함께 봐요.
      </p>
    </form>
  );
}
