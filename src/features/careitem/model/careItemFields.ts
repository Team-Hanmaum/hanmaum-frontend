import type { CareItemFields, CareItemKind } from "./careItemViewTypes";

export const emptyCareFields: CareItemFields = {
  title: "",
  content: "",
  date: "",
  time: "",
  location: "",
  assigneeId: "",
  dueDate: "",
  note: "",
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
export function validateCareFields(kind: CareItemKind, fields: CareItemFields) {
  const errors: Partial<Record<keyof CareItemFields, string>> = {};
  if (!(kind === "schedule" ? fields.title : fields.content).trim())
    errors[kind === "schedule" ? "title" : "content"] =
      "반영할 내용을 입력해 주세요.";
  if (kind === "schedule" && !fields.date)
    errors.date = "날짜를 선택해 주세요.";
  return errors;
}
