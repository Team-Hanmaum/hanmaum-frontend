// 화면 표현용 모델. BE 응답 DTO나 인증·참여 권한 판정에 사용하지 않는다.
export type CareSpaceView = {
  id: string;
  subjectLabel: string;
  role: "owner" | "member";
  members: {
    id: string;
    name: string;
    role: "owner" | "member";
    self?: boolean;
  }[];
  empty: boolean;
};

export function careSpaceName(space: Pick<CareSpaceView, "subjectLabel">) {
  return `${space.subjectLabel}의 돌봄`;
}
