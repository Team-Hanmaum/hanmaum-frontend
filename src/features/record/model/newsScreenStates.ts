export const newsListStates = [
  { value: "default", label: "소식 목록" },
  { value: "empty", label: "빈 목록" },
  { value: "loading", label: "첫 로딩" },
  { value: "error", label: "불러오기 실패" },
  { value: "more-error", label: "추가 소식 조회 실패" },
] as const;
export type NewsListState = (typeof newsListStates)[number]["value"];

export const newsCreateStates = [
  { value: "default", label: "기본" },
  { value: "error", label: "등록 실패" },
] as const;

export const newsDetailStates = [
  { value: "default", label: "소식에 저장된 상태" },
  { value: "analyzing", label: "분석 중" },
  { value: "review", label: "제안 있음 (예시 소식)" },
  { value: "no-change", label: "새 제안 없음" },
  { value: "failed", label: "분석 실패" },
] as const;
