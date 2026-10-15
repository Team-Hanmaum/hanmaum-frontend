import type {
  CareItemFields,
  CareItemKind,
  CareItemView,
  CareReconfirmation,
} from "@/features/careitem/model/careItemViewTypes";
import type { RecordDeletion } from "@/features/record/model/recordDeletionTypes";
// 화면 확인용 모델. 공개 API DTO·권한 계약과 구분한다.
export type ProposalStatus = "review" | "requested" | "applied" | "rejected";
export type ProposalActor = { id: string; name: string };
export type ProposalView = {
  id: string;
  recordId: string;
  targetId: string;
  kind: CareItemKind;
  operation?: "create" | "update" | "link";
  revision?: number;
  beforeFields?: CareItemFields;
  afterFields?: CareItemFields;
  edited?: boolean;
  sourceDeleted?: boolean;
  title: string;
  typeLabel: string;
  beforeLabel: string;
  beforeValue: string;
  afterLabel: string;
  afterValue: string;
  context: string;
  targetVersion: number;
  status: ProposalStatus;
  requestId?: string;
  resultId?: string;
};
export type ProposalRequest = {
  id: string;
  author: ProposalActor;
  createdAt: number;
  // 제출 시점의 내용. 이후 대상 변경이나 승인 처리로 덮어쓰지 않는다.
  proposals: readonly ProposalView[];
};
export type ProposalResult = {
  id: string;
  decision: "applied" | "rejected";
  actor: ProposalActor;
  createdAt: number;
  proposals: readonly ProposalView[];
};
export type ProposalCareItem = CareItemView;
export type ProposalSpaceState = {
  deletions?: readonly RecordDeletion[];
  reconfirmations?: readonly CareReconfirmation[];
  proposals: readonly ProposalView[];
  requests: readonly ProposalRequest[];
  results: readonly ProposalResult[];
  // 제안·제출 내용과 현재 확정된 예시 정보를 별도로 보관한다.
  items: readonly ProposalCareItem[];
};
export type ProposalSelection = {
  id: string;
  version: number;
  revision?: number;
};
export type ProposalFailure = {
  ok: false;
  reason:
    | "permission"
    | "selection"
    | "changed"
    | "source"
    | "conflict"
    | "confirmed-question";
  proposalIds: readonly string[];
};
export type ProposalOutcome = { ok: true; id: string } | ProposalFailure;

export const proposalTabs = [
  { value: "review", label: "검토 대기" },
  { value: "requested", label: "승인 요청" },
  { value: "applied", label: "반영" },
  { value: "rejected", label: "미적용" },
] as const;

export function proposalStatusLabel(status: ProposalStatus) {
  return proposalTabs.find((tab) => tab.value === status)!.label;
}
