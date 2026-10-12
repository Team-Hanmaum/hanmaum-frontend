export const homeScreenStates = [
  { value: "default", label: "일반 홈" },
  { value: "empty", label: "빈 홈" },
  { value: "created", label: "공간 생성 직후" },
  { value: "joined", label: "초대 참여 직후" },
  { value: "loading", label: "홈 로딩" },
  { value: "error", label: "홈 전체 오류" },
  { value: "section-error", label: "일정 영역 오류" },
  { value: "menu-loading", label: "공간 메뉴 로딩" },
  { value: "menu-error", label: "공간 메뉴 오류" },
  { value: "switch-error", label: "공간 전환 실패" },
] as const;
export type HomeScreenState = (typeof homeScreenStates)[number]["value"];
