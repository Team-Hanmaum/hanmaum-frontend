export const familyListStates = [
  { value: "default", label: "현재 가족" },
  { value: "loading", label: "불러오는 중" },
  { value: "error", label: "목록 조회 실패" },
  { value: "forbidden", label: "접근 종료" },
] as const;
export const familyActionStates = [
  { value: "default", label: "정상 흐름" },
  { value: "error", label: "확정 실패 예시" },
  { value: "missing", label: "대상 참여 종료 예시" },
  { value: "forbidden", label: "관리 권한 없음" },
] as const;
