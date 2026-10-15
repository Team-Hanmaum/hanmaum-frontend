import type {
  CareItemFields,
  CareItemKind,
  CareItemStatus,
  CareItemView,
} from "./careItemViewTypes";

// API DTO와 구분하는 화면 검증용 변경 요청/결과 모델.
export type CareChangeOperation =
  "create" | "edit" | "assignee" | "status" | "answer" | "delete";
export type CareChangeDraft = {
  id: string;
  itemId: string;
  kind: CareItemKind;
  version: number;
  operation: CareChangeOperation;
  fields: CareItemFields;
  nextStatus?: CareItemStatus;
  answer: string;
  evidence: string;
};
export type CareChange = {
  id: string;
  draft: CareChangeDraft;
  status: "requested" | "applied" | "rejected";
  author: { id: string; name: string };
  createdAt: number;
  decidedBy?: { id: string; name: string };
  decidedAt?: number;
  before?: CareItemView;
  after?: CareItemView;
  redacted?: boolean;
};
export type CareChangeOutcome =
  { ok: true; id: string } | { ok: false; message: string };
