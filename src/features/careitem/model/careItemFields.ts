import type { CareItemFields, CareItemKind } from "./careItemViewTypes";

export const emptyCareFields: CareItemFields = {
  title: "",
  content: "",
  date: "",
  time: "",
  location: "",
  assigneeId: "",
  dueDate: "",
};
export function formatCareDate(value: string) {
  if (!value) return "정하지 않음";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? "날짜 확인 필요"
    : new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(date);
}
export function formatCareTime(value: string) {
  if (!value) return "정하지 않음";
  const [hour, minute] = value.split(":").map(Number);
  return `${hour < 12 ? "오전" : "오후"} ${hour % 12 || 12}:${String(minute).padStart(2, "0")}`;
}
export function careValue(kind: CareItemKind, fields: CareItemFields) {
  if (kind !== "schedule") return fields.content || fields.title;
  if (!fields.date) return "날짜 확인 필요";
  const [, month, day] = fields.date.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}
export function careMeta(kind: CareItemKind, fields: CareItemFields) {
  if (kind === "schedule")
    return [
      fields.date.slice(0, 4) && `${fields.date.slice(0, 4)}년`,
      formatCareTime(fields.time),
      "예정",
      fields.location,
    ]
      .filter(Boolean)
      .join(" · ");
  return kind === "task"
    ? "미시작"
    : kind === "question"
      ? "미확인"
      : kind === "observation"
        ? "가족의 관찰"
        : "전달받은 안내";
}
export function validateCareFields(kind: CareItemKind, fields: CareItemFields) {
  const errors: Partial<Record<keyof CareItemFields, string>> = {};
  if (!(kind === "schedule" ? fields.title : fields.content).trim())
    errors[kind === "schedule" ? "title" : "content"] =
      "반영할 내용을 입력해 주세요.";
  if (kind === "schedule" && !fields.date)
    errors.date = "날짜를 선택해 주세요.";
  return errors;
}
export function describeCareFields(
  kind: CareItemKind,
  fields: CareItemFields,
  members: readonly { id: string; name: string }[] = [],
) {
  return [
    kind === "schedule"
      ? `${formatCareDate(fields.date)} · ${formatCareTime(fields.time)}`
      : fields.content,
    fields.location && `장소: ${fields.location}`,
    kind === "task" &&
      `담당자: ${members.find((member) => member.id === fields.assigneeId)?.name ?? "미지정"}`,
    fields.dueDate && `기한: ${formatCareDate(fields.dueDate)}`,
  ]
    .filter(Boolean)
    .join("\n");
}
