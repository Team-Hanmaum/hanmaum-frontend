// 화면 검증용 모델. 공개 API의 필드·상태 계약과 구분한다.
export type CareItemKind =
  "schedule" | "task" | "question" | "observation" | "guidance";
// 화면 확인용 상태. BE enum과 별도로 관리한다.
export type CareItemStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "not-started"
  | "in-progress"
  | "unconfirmed"
  | "confirmed"
  | "recorded";
export type CareItemFields = {
  title: string;
  content: string;
  date: string;
  time: string;
  location: string;
  assigneeId: string;
  dueDate: string;
};
export type CareEvidence = {
  id: string;
  recordId?: string;
  author: string;
  createdAt: number;
  // 직접 확인한 독립 근거만 내용 보유. 소식 근거의 원문은 record에서 조회한다.
  directContent?: string;
  fields: CareItemFields;
  dependsOnRecordIds?: readonly string[];
};
export type CareReconfirmation = {
  id: string;
  itemId: string;
  actor: string;
  createdAt: number;
  fields: CareItemFields;
  evidence: string;
};
export type CareItemView = {
  id: string;
  kind: CareItemKind;
  status: CareItemStatus;
  statusChangedAt?: number;
  answer?: { content: string; confirmedBy: string };
  title: string;
  value: string;
  meta: string;
  version: number;
  fields: CareItemFields;
  evidence: readonly CareEvidence[];
  needsReconfirmation?: boolean;
};
export const careKindLabels: Record<CareItemKind, string> = {
  schedule: "일정",
  task: "할 일",
  question: "질문",
  observation: "관찰",
  guidance: "안내",
};
