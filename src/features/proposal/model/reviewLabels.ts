import type { ProposalAction, ProposalStatus } from "../api/proposalReadTypes";
import type { RequestStatus } from "../api/changeRequestTypes";
export const actionLabels: Record<ProposalAction, string> = {
  CREATE_ITEM: "새 항목",
  UPDATE_ITEM: "내용 변경",
  DELETE_ITEM: "항목 삭제",
  UPDATE_SPACE: "공간 정보 변경",
  RESOLVE_QUESTION: "답변 확인",
  LINK_EVIDENCE: "근거 연결",
};
export const proposalStatusLabels: Record<ProposalStatus, string> = {
  REVIEW_PENDING: "검토 필요",
  APPLIED: "반영됨",
  DECLINED: "반영하지 않음",
  INVALIDATED: "검토할 수 없음",
};
export const requestStatusLabels: Record<RequestStatus, string> = {
  PENDING: "소유자 확인 대기",
  APPLIED: "반영됨",
  DECLINED: "반영하지 않음",
  CANCELED: "요청 취소",
  INVALIDATED: "확인할 수 없음",
};
