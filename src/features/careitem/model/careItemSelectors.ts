import type { CareItemKind } from "./careItemViewTypes";

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
