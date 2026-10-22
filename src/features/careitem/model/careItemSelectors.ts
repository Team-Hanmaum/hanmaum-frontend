import type { CareItemKind, CareItemView } from "./careItemViewTypes";
import { formatCareDate, formatCareTime } from "./careItemFields";
import { careStatusLabels } from "./careItemStatus";
import { sortCareItems } from "./careItemSort";
export { initialCareStatus } from "./careItemStatus";

export const careTypeTabs = [
  { value: "schedule", label: "일정" },
  { value: "task", label: "할 일" },
  { value: "question", label: "질문" },
  { value: "observation", label: "관찰" },
  { value: "guidance", label: "안내" },
] as const;
export const careStatusTabs = {
  schedule: [
    { value: "upcoming", label: "예정" },
    { value: "past", label: "지난 일정" },
    { value: "closed", label: "완료·취소" },
  ],
  task: [
    { value: "remaining", label: "남은 할 일" },
    { value: "completed", label: "완료" },
  ],
  question: [
    { value: "unconfirmed", label: "미확인" },
    { value: "confirmed", label: "확인됨" },
  ],
  observation: [],
  guidance: [],
} as const;
export type CareListStatus =
  (typeof careStatusTabs)[CareItemKind][number]["value"];
export type CareListFilter = { type: CareItemKind; status?: CareListStatus };

export function readCareListFilter(params: URLSearchParams): CareListFilter {
  const type =
    careTypeTabs.find((tab) => tab.value === params.get("type"))?.value ??
    "schedule";
  const tabs = careStatusTabs[type];
  return {
    type,
    status:
      tabs.find((tab) => tab.value === params.get("status"))?.value ??
      tabs[0]?.value,
  };
}
export function careStatusLabel(item: CareItemView) {
  if (item.needsReconfirmation) return "재확인 필요";
  if (item.kind === "observation") return "가족의 관찰";
  if (item.kind === "guidance") return "전달받은 안내";
  return careStatusLabels[item.status];
}

export function careItemListFilter(
  item: CareItemView,
  now: number,
): CareListFilter {
  if (item.kind === "schedule")
    return {
      type: "schedule",
      status:
        item.status === "completed" || item.status === "cancelled"
          ? "closed"
          : isPastSchedule(item, now)
            ? "past"
            : "upcoming",
    };
  if (item.kind === "task")
    return {
      type: "task",
      status: item.status === "completed" ? "completed" : "remaining",
    };
  if (item.kind === "question")
    return {
      type: "question",
      status: item.status === "confirmed" ? "confirmed" : "unconfirmed",
    };
  return { type: item.kind };
}

// 지난 일정은 표시 분류일 뿐 상태를 변경하지 않는다. 시간 미정이면 날짜만 비교한다.
export function isPastSchedule(item: CareItemView, now: number) {
  if (
    item.kind !== "schedule" ||
    item.status !== "scheduled" ||
    item.needsReconfirmation ||
    !item.fields.date
  )
    return false;
  const date = new Date(
    `${item.fields.date}T${item.fields.time || "00:00"}:00`,
  ).getTime();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return (
    Number.isFinite(date) && date < (item.fields.time ? now : today.getTime())
  );
}

export function selectCareItems(
  items: readonly CareItemView[],
  filter: CareListFilter,
  now: number,
) {
  const filtered = items.filter((item) => {
    if (item.kind !== filter.type || item.needsReconfirmation || item.deletedAt)
      return false;
    if (filter.type === "schedule") {
      if (filter.status === "closed")
        return item.status === "completed" || item.status === "cancelled";
      return (
        item.status === "scheduled" &&
        isPastSchedule(item, now) === (filter.status === "past")
      );
    }
    if (filter.type === "task")
      return filter.status === "completed"
        ? item.status === "completed"
        : item.status === "not-started" || item.status === "in-progress";
    if (filter.type === "question")
      return (
        item.status ===
        (filter.status === "confirmed" ? "confirmed" : "unconfirmed")
      );
    return true;
  });
  return sortCareItems(filtered, filter);
}
export function careAssignee(
  item: CareItemView,
  members: readonly { id: string; name: string; self?: boolean }[],
) {
  const member = members.find((entry) => entry.id === item.fields.assigneeId);
  return member ? `${member.name}${member.self ? " · 나" : ""}` : "미지정";
}
export function careCardMeta(
  item: CareItemView,
  members: readonly { id: string; name: string; self?: boolean }[],
) {
  if (item.needsReconfirmation) return "유효한 근거를 다시 확인해야 해요.";
  switch (item.kind) {
    case "schedule":
      return `${formatCareDate(item.fields.date)} · ${formatCareTime(item.fields.time)}`;
    case "task":
      return `담당자 ${careAssignee(item, members)}`;
    case "question":
      return item.status === "confirmed"
        ? `${item.answer?.confirmedBy ?? "소유자"}님이 확인했어요`
        : "아직 확인된 답이 없어요";
    case "observation":
      return item.fields.date
        ? formatCareDate(item.fields.date)
        : "관찰 시점 미정";
    case "guidance":
      return [
        item.fields.location || "기관 미정",
        item.fields.date && formatCareDate(item.fields.date),
      ]
        .filter(Boolean)
        .join(" · ");
  }
}
export function careCardBody(item: CareItemView) {
  if (item.needsReconfirmation)
    return "소유자가 새 내용을 확인하기 전까지 기존 내용은 표시하지 않아요.";
  if (
    item.kind === "task" &&
    item.status === "completed" &&
    item.statusChangedAt
  )
    return `${new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }).format(item.statusChangedAt)}에 완료했어요.`;
  if (item.kind === "task")
    return item.fields.dueDate
      ? `기한 ${formatCareDate(item.fields.dueDate)}`
      : "정해진 기한이 없어요.";
  if (item.kind === "question")
    return item.status === "confirmed"
      ? item.answer?.content
      : "알고 있는 가족이 답과 근거를 남겨 주세요.";
  if (item.kind === "schedule") return item.fields.location || undefined;
  return item.fields.content;
}
