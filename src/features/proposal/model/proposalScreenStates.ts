export const proposalListStates = [
  { value: "default", label: "기본" },
  { value: "empty", label: "빈 목록" },
  { value: "loading", label: "불러오는 중" },
  { value: "error", label: "조회 실패" },
] as const;
export const proposalReviewStates = [
  { value: "default", label: "기본" },
  { value: "request-error", label: "요청 실패" },
] as const;
export const proposalConfirmStates = [
  { value: "default", label: "기본" },
  { value: "changed", label: "현재 정보 변경 · 반영 실패" },
] as const;
