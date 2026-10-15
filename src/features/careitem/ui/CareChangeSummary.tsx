import { Comparison } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { CareChangeDraft } from "../model/careChangeTypes";
import type { CareItemFields, CareItemView } from "../model/careItemViewTypes";
import { careStatusLabels } from "../model/careItemStatus";
import {
  formatCareDate,
  formatCareTime,
  describeCareFields,
} from "../model/careItemFields";
import { CareSection } from "./CareSection";

export function CareChangeSummary({
  draft,
  before,
  space,
}: {
  draft: CareChangeDraft;
  before?: CareItemView;
  space: CareSpaceView;
}) {
  const keys: (keyof CareItemFields)[] =
    draft.operation === "assignee"
      ? ["assigneeId"]
      : draft.kind === "schedule"
        ? ["title", "date", "time", "location"]
        : draft.kind === "task"
          ? ["content", "assigneeId", "dueDate", "note"]
          : draft.kind === "observation"
            ? ["content", "date"]
            : draft.kind === "guidance"
              ? ["content", "location", "date"]
              : ["content", "note"];
  const labels: Record<keyof CareItemFields, string> = {
    title: "이름",
    content: "내용",
    date: "날짜",
    time: "시간",
    location: "장소",
    assigneeId: "담당자",
    dueDate: "기한",
    note: "추가 설명·메모",
  };
  function display(key: keyof CareItemFields, value: string) {
    if (!value) return key === "assigneeId" ? "미지정" : "없음";
    if (key === "date" || key === "dueDate") return formatCareDate(value);
    if (key === "time") return formatCareTime(value);
    if (key === "assigneeId")
      return (
        space.members.find((member) => member.id === value)?.name ?? "참여 종료"
      );
    return value;
  }
  return (
    <>
      {draft.operation === "status" && before && draft.nextStatus ? (
        <Comparison
          beforeLabel="현재 상태"
          beforeValue={careStatusLabels[before.status]}
          afterLabel="변경 후"
          afterValue={careStatusLabels[draft.nextStatus]}
        />
      ) : draft.operation === "answer" ? (
        <>
          <CareSection title="질문">{before?.fields.content}</CareSection>
          <CareSection title="답변">{draft.answer}</CareSection>
        </>
      ) : draft.operation === "delete" ? (
        <CareSection title="삭제할 항목">
          {before?.title}
          {"\n"}
          {before &&
            describeCareFields(before.kind, before.fields, space.members)}
        </CareSection>
      ) : (
        keys
          .filter((key) =>
            draft.operation === "create"
              ? Boolean(draft.fields[key])
              : draft.fields[key] !== before?.fields[key],
          )
          .map((key) =>
            draft.operation === "create" ? (
              <CareSection
                key={key}
                title={labels[key]}
              >
                {display(key, draft.fields[key])}
              </CareSection>
            ) : (
              <Comparison
                key={key}
                beforeLabel={`현재 · ${labels[key]}`}
                beforeValue={display(key, before?.fields[key] ?? "")}
                afterLabel="변경 후"
                afterValue={display(key, draft.fields[key])}
              />
            ),
          )
      )}
      {draft.evidence && (
        <CareSection
          title={
            draft.operation === "answer" ? "어떻게 확인했나요?" : "변경 근거"
          }
        >
          {draft.evidence}
        </CareSection>
      )}
    </>
  );
}
