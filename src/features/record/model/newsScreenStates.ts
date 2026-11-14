export const newsListStates = [
  { value: "default", label: "소식 목록" },
  { value: "empty", label: "빈 목록" },
  { value: "loading", label: "첫 로딩" },
  { value: "error", label: "불러오기 실패" },
  { value: "more-error", label: "추가 소식 조회 실패" },
] as const;
export type NewsListState = (typeof newsListStates)[number]["value"];
