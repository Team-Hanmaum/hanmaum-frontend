import type { ProposalDetail } from "../api/proposalReadTypes";
import type {
  CareDetail,
  CareValues,
  ItemType,
} from "@/features/careitem/api/careReadTypes";
import { flattenCareValues } from "@/features/careitem/model/careReadView";
export type ProposalDraft = {
  reviewToken: string;
  targetItemId: string | null;
  targetVersion: string | null;
  before: CareValues;
  values: CareValues;
};
export const itemFields: Record<ItemType, readonly string[]> = {
  SCHEDULE: ["scheduledDate", "scheduledTime", "location"],
  TASK: ["dueDate", "assigneeMembershipId"],
  QUESTION: [],
  OBSERVATION: ["observedDate", "observedTimeText"],
  GUIDANCE: ["sourceName", "receivedDate"],
};
export function draftKeys(proposal: ProposalDetail) {
  if (proposal.action === "LINK_EVIDENCE") return [];
  if (proposal.action === "RESOLVE_QUESTION") return ["confirmedAnswer"];
  return [
    "title",
    "description",
    ...itemFields[proposal.itemType],
    ...(proposal.action === "UPDATE_ITEM" &&
    ["SCHEDULE", "TASK"].includes(proposal.itemType)
      ? ["status"]
      : []),
  ];
}
export function initialProposalDraft(
  proposal: ProposalDetail,
  target?: CareDetail,
): ProposalDraft {
  const before = target
    ? flattenCareValues(target)
    : flattenCareValues(proposal.currentValues);
  const proposed = flattenCareValues(proposal.proposedValues);
  const values: CareValues = { ...before };
  const keys = draftKeys(proposal);
  const canonical = (field: string) => {
    const key = field.replace(/^fields\./, "");
    if (key === "content") return "description";
    if (key === "time") return "scheduledTime";
    if (key === "date")
      return proposal.itemType === "TASK"
        ? "dueDate"
        : proposal.itemType === "OBSERVATION"
          ? "observedDate"
          : proposal.itemType === "GUIDANCE"
            ? "receivedDate"
            : "scheduledDate";
    return key;
  };
  if (proposal.action === "RESOLVE_QUESTION")
    values.confirmedAnswer = proposed.answerText ?? null;
  else
    for (const key of keys) {
      if (proposal.action === "CREATE_ITEM")
        values[key] = proposed[key] ?? null;
      else if (proposal.clearFields.some((field) => canonical(field) === key))
        values[key] = null;
      else if (
        proposal.changedFields.some((field) => canonical(field) === key) ||
        (!proposal.changedFields.length &&
          !proposal.clearFields.length &&
          proposed[key] != null)
      )
        values[key] = proposed[key] ?? null;
    }
  return {
    reviewToken: proposal.reviewToken ?? "",
    targetItemId: target?.itemId ?? proposal.targetItemId,
    targetVersion: target?.version ?? proposal.currentItemVersion,
    before,
    values,
  };
}
export function proposalInputValues(
  proposal: ProposalDetail,
  draft: ProposalDraft,
): CareValues | null {
  if (proposal.action === "LINK_EVIDENCE") return null;
  if (proposal.action === "RESOLVE_QUESTION")
    return { confirmedAnswer: draft.values.confirmedAnswer };
  const create = proposal.action === "CREATE_ITEM";
  const keys = draftKeys(proposal).filter(
    (key) =>
      create || (draft.values[key] ?? null) !== (draft.before[key] ?? null),
  );
  const result: CareValues = create
    ? { itemType: proposal.itemType, fields: {} }
    : {};
  const fields: CareValues = {};
  for (const key of keys) {
    const value = draft.values[key] ?? null;
    if (["title", "description", "status"].includes(key)) result[key] = value;
    else fields[key] = value;
  }
  if (create || Object.keys(fields).length) result.fields = fields;
  return result;
}
export function proposalDraftProblem(
  proposal: ProposalDetail,
  draft: ProposalDraft,
): string | undefined {
  if (
    proposal.status !== "REVIEW_PENDING" ||
    !proposal.reviewToken ||
    draft.reviewToken !== proposal.reviewToken
  )
    return "제안이 바뀌었어요. 최신 내용을 다시 검토해 주세요.";
  if (
    ![
      "CREATE_ITEM",
      "UPDATE_ITEM",
      "RESOLVE_QUESTION",
      "LINK_EVIDENCE",
    ].includes(proposal.action)
  )
    return "이 제안 동작은 아직 지원하지 않아요.";
  if (
    proposal.action !== "CREATE_ITEM" &&
    (!draft.targetItemId || !draft.targetVersion)
  )
    return "먼저 연결할 대상을 선택해 주세요.";
  if (proposal.targetItemId && draft.targetItemId !== proposal.targetItemId)
    return "제안에 지정된 대상을 변경할 수 없어요.";
  if (
    !proposal.targetItemId &&
    proposal.action !== "CREATE_ITEM" &&
    !proposal.candidates.some((c) => c.itemId === draft.targetItemId)
  )
    return "제안의 후보에서 대상을 다시 선택해 주세요.";
  if (proposal.action === "LINK_EVIDENCE") return;
  if (proposal.itemType === "QUESTION" && draft.before.status === "CONFIRMED")
    return "이미 답변 확인이 끝난 질문이에요. 해당 질문의 내용을 변경할 수 없어요.";
  const input = proposalInputValues(proposal, draft);
  if (proposal.action === "RESOLVE_QUESTION")
    return typeof draft.values.confirmedAnswer !== "string" ||
      !draft.values.confirmedAnswer.trim()
      ? "확정할 답변을 입력해 주세요."
      : undefined;
  if (typeof draft.values.title !== "string" || !draft.values.title.trim())
    return "제목을 입력해 주세요.";
  if (proposal.action === "UPDATE_ITEM" && !Object.keys(input ?? {}).length)
    return "현재 내용과 다른 변경 사항이 없어요.";
}
