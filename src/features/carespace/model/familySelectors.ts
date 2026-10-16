import type { CareItemView } from "@/features/careitem/model/careItemViewTypes";

export function unfinishedMemberTasks(
  items: readonly CareItemView[],
  memberId: string,
) {
  return items.filter(
    (item) =>
      item.kind === "task" &&
      !item.deletedAt &&
      item.status !== "completed" &&
      item.status !== "cancelled" &&
      item.fields.assigneeId === memberId,
  );
}
export function memberTaskLabel(count: number, management = false) {
  return `맡은 ${management ? "미완료 " : ""}할 일 ${count ? `${count}개` : "없음"}`;
}
