// 폼과 탭에서 사용하는 표시용 타입. 서버 DTO는 api/*Types.ts에서 관리한다.
export type CareItemKind =
  "schedule" | "task" | "question" | "observation" | "guidance";
export type CareItemFields = {
  title: string;
  content: string;
  date: string;
  time: string;
  location: string;
  assigneeId: string;
  dueDate: string;
  note: string;
};
export const careKindLabels: Record<CareItemKind, string> = {
  schedule: "일정",
  task: "할 일",
  question: "질문",
  observation: "관찰",
  guidance: "안내",
};
