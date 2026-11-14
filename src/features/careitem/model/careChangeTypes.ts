// 화면에서 선택하는 돌봄 편집 동작. 서버 요청 DTO와 별도로 관리한다.
export type CareChangeOperation =
  "create" | "edit" | "assignee" | "status" | "answer" | "delete";
