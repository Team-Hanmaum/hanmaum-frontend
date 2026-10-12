export const invitationScreenStates = [
  { value: "default", label: "링크 준비 완료" },
  { value: "copied", label: "복사 완료 표시 (UI 예시)" },
  { value: "expired", label: "기간 만료" },
  { value: "error", label: "발급 오류" },
  { value: "loading", label: "발급 중" },
] as const;

export type InvitationScreenState =
  (typeof invitationScreenStates)[number]["value"];
