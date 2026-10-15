import { useState, type ChangeEvent } from "react";
import { BottomSheet, Notice } from "@/components/feedback";
import {
  Button,
  Field,
  MenuRow,
  SelectionRow,
  TextAction,
} from "@/components/ui";
import { DatePicker } from "@/components/ui/DatePicker";
import { formatCareDate, formatCareTime } from "../model/careItemFields";
import type { CareItemFields, CareItemKind } from "../model/careItemViewTypes";

type Picker = "date" | "assigneeId" | "dueDate";
const contentLabels = {
  task: "할 일",
  question: "확인할 질문",
  observation: "관찰 내용",
  guidance: "안내 내용",
  schedule: "일정 이름",
};
export function CareFieldsForm({
  kind,
  fields,
  onChange,
  onTimeSelect,
  members,
  errors = {},
  disabled = false,
  original,
  direct = false,
}: {
  kind: CareItemKind;
  fields: CareItemFields;
  onChange: (fields: CareItemFields) => void;
  onTimeSelect: () => void;
  members: readonly { id: string; name: string; role: string }[];
  errors?: Partial<Record<keyof CareItemFields, string>>;
  disabled?: boolean;
  original?: string;
  direct?: boolean;
}) {
  const [picker, setPicker] = useState<Picker | null>(null);
  const [selection, setSelection] = useState("");
  function open(key: Picker) {
    setSelection(fields[key]);
    setPicker(key);
  }
  const update = (key: keyof CareItemFields, value: string) =>
    onChange({ ...fields, [key]: value });
  const pickerTitle = picker === "assigneeId" ? "담당자 선택" : "날짜 선택";
  return (
    <>
      {kind === "schedule" ? (
        <Field
          label="일정 이름"
          value={fields.title}
          helper={original ? `AI 제안 · ${original}` : undefined}
          error={errors.title}
          disabled={disabled}
          onChange={(event) => update("title", event.target.value)}
        />
      ) : (
        <Field
          label={direct && kind === "question" ? "질문" : contentLabels[kind]}
          multiline={!(direct && kind === "task")}
          rows={kind === "task" ? 2 : 5}
          value={fields.content}
          helper={original ? `AI 제안 · ${original}` : undefined}
          error={errors.content}
          disabled={disabled}
          onChange={(
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => {
            const content = event.target.value;
            onChange({ ...fields, content, title: content });
          }}
        />
      )}
      {(kind === "schedule"
        ? (["date", "time"] as const)
        : kind === "task"
          ? (["assigneeId", "dueDate"] as const)
          : []
      ).map((key) => (
        <div
          key={key}
          className="flex flex-col gap-hm-8"
        >
          <p className="text-hm-body-emphasis">
            {key === "date"
              ? "날짜"
              : key === "time"
                ? "시간"
                : key === "assigneeId"
                  ? "담당자"
                  : "기한 (선택)"}
          </p>
          <MenuRow
            aria-label={`${key === "date" ? "날짜" : key === "time" ? "시간" : key === "assigneeId" ? "담당자" : "기한"} 선택`}
            icon={
              key === "time"
                ? "clock-brand"
                : key === "assigneeId"
                  ? "person-brand"
                  : "care-brand"
            }
            title={
              key === "assigneeId"
                ? (members.find((member) => member.id === fields.assigneeId)
                    ?.name ?? "미지정")
                : key === "time"
                  ? fields.time
                    ? formatCareTime(fields.time)
                    : "시간 선택"
                  : fields[key]
                    ? formatCareDate(fields[key])
                    : "날짜 선택"
            }
            className="border border-hm-border-default"
            disabled={disabled}
            onClick={() => (key === "time" ? onTimeSelect() : open(key))}
          />
          {errors[key] && (
            <p
              role="alert"
              className="text-hm-body-small text-hm-feedback-error-text"
            >
              {errors[key]}
            </p>
          )}
        </div>
      ))}
      {kind === "schedule" && (
        <Field
          label="장소 (선택)"
          value={fields.location}
          onChange={(event) => update("location", event.target.value)}
          helper={direct ? undefined : "소식에 없는 장소는 미리 채우지 않아요."}
          disabled={disabled}
        />
      )}
      {direct && (kind === "task" || kind === "question") && (
        <Field
          label={kind === "task" ? "메모 (선택)" : "추가 설명 (선택)"}
          multiline
          rows={5}
          value={fields.note}
          onChange={(event) => update("note", event.target.value)}
          disabled={disabled}
        />
      )}
      {!direct && kind !== "schedule" && (
        <Notice
          title={
            kind === "task"
              ? "담당자는 한 명 또는 미지정"
              : kind === "question"
                ? "아직 확인되지 않은 질문이에요"
                : kind === "observation"
                  ? "가족이 관찰한 사실로 남겨요"
                  : "전달받은 안내로 남겨요"
          }
          body={
            kind === "task"
              ? "소식에 없는 기한은 추측하지 않아요."
              : kind === "question"
                ? "문장을 수정해도 답변이 생기거나 확인됨으로 바뀌지 않아요."
                : kind === "observation"
                  ? "기록에 없는 건강 상태나 진단을 덧붙이지 않아요."
                  : "기관의 안내와 가족의 관찰을 구분해요."
          }
        />
      )}
      <BottomSheet
        open={picker !== null}
        onOpenChange={(open) => {
          if (!open) setPicker(null);
        }}
        title={pickerTitle}
        footer={
          <>
            <Button
              disabled={picker === "date" && !selection}
              onClick={() => {
                if (picker) update(picker, selection);
                setPicker(null);
              }}
            >
              {picker === "assigneeId" ? "선택 완료" : "이 날짜로 선택"}
            </Button>
            <TextAction onClick={() => setPicker(null)}>돌아가기</TextAction>
          </>
        }
      >
        {picker === "date" || picker === "dueDate" ? (
          <>
            <p className="text-hm-title-page">언제인가요?</p>
            <DatePicker
              value={selection}
              onChange={setSelection}
            />
            <Notice
              title={formatCareDate(selection)}
              body="선택한 날짜가 입력 화면에 들어가요."
            />
            {picker === "dueDate" && (
              <TextAction onClick={() => setSelection("")}>
                기한 정하지 않음
              </TextAction>
            )}
          </>
        ) : (
          picker === "assigneeId" && (
            <>
              <p className="text-hm-title-page">누가 챙길까요?</p>
              <SelectionRow
                control="radio"
                name="assignee"
                label="미지정"
                description="아직 담당자를 정하지 않음"
                checked={!selection}
                onChange={() => setSelection("")}
              />
              {members.map((member) => (
                <SelectionRow
                  key={member.id}
                  control="radio"
                  name="assignee"
                  label={member.name}
                  description={member.role === "owner" ? "소유자" : "구성원"}
                  checked={selection === member.id}
                  onChange={() => setSelection(member.id)}
                />
              ))}
            </>
          )
        )}
      </BottomSheet>
    </>
  );
}
