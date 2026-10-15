import type {
  CareItemKind,
  CareItemStatus,
  CareItemView,
} from "./careItemViewTypes";

// 소유자가 답을 확인한 질문은 종료된 항목으로 취급한다.
export function isConfirmedQuestion(item: CareItemView | undefined): boolean {
  return item?.kind === "question" && item.status === "confirmed";
}

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
