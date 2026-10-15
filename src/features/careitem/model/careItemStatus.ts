import type { CareItemKind, CareItemStatus } from "./careItemViewTypes";

export const careStatusLabels: Record<CareItemStatus, string> = {
  scheduled: "예정",
  completed: "완료",
  cancelled: "취소",
  "not-started": "미시작",
  "in-progress": "진행 중",
  unconfirmed: "미확인",
  confirmed: "확인됨",
  recorded: "확정",
};
export function initialCareStatus(kind: CareItemKind): CareItemStatus {
  return kind === "schedule"
    ? "scheduled"
    : kind === "task"
      ? "not-started"
      : kind === "question"
        ? "unconfirmed"
        : "recorded";
}
