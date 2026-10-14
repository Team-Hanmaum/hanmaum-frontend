import type { ProposalSelection } from "./proposalViewTypes";

export type ProposalConfirmation = {
  selection: ProposalSelection[];
  recordId?: string;
  requestId?: string;
};

// 주소 직접 진입·새로고침·잘못된 history state를 빈 선택으로 안전하게 처리한다.
export function readProposalConfirmation(
  value: unknown,
): ProposalConfirmation | null {
  if (
    !value ||
    typeof value !== "object" ||
    !("selection" in value) ||
    !Array.isArray(value.selection)
  )
    return null;
  if (
    !value.selection.length ||
    !value.selection.every(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string" &&
        "version" in item &&
        typeof item.version === "number" &&
        Number.isInteger(item.version) &&
        item.version > 0,
    )
  )
    return null;
  const recordId =
    "recordId" in value && typeof value.recordId === "string"
      ? value.recordId
      : undefined;
  const requestId =
    "requestId" in value && typeof value.requestId === "string"
      ? value.requestId
      : undefined;
  if (Boolean(recordId) === Boolean(requestId)) return null;
  return {
    selection: value.selection as ProposalSelection[],
    recordId,
    requestId,
  };
}
