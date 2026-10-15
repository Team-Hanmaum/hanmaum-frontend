export const careListStates = [
  { value: "default", label: "기본 목록" },
  { value: "empty", label: "처음 사용하는 빈 목록" },
  { value: "no-results", label: "선택한 목록 0건" },
  { value: "loading", label: "첫 목록 불러오는 중" },
  { value: "error", label: "첫 목록 불러오기 실패" },
  { value: "more-error", label: "추가 목록 불러오기 실패" },
] as const;
export type CareListState = (typeof careListStates)[number]["value"];
