import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { emptyCareFields, validateCareFields } from "./careItemFields";
import { initialCareStatus, isConfirmedQuestion } from "./careItemStatus";
import {
  careKindLabels,
  type CareItemKind,
  type CareItemView,
  type CareItemStatus,
} from "./careItemViewTypes";
import type { CareChangeDraft, CareChangeOperation } from "./careChangeTypes";

export const changeLabels: Record<CareChangeOperation, string> = {
  create: "등록",
  edit: "내용 변경",
  assignee: "담당자 변경",
  status: "상태 변경",
  answer: "답변 확인",
  delete: "삭제",
};
export function careChangeTitle(draft: CareChangeDraft) {
  return `${careKindLabels[draft.kind]} ${changeLabels[draft.operation]}`;
}
export function makeCareDraft(
  kind: CareItemKind,
  operation: CareChangeOperation,
  item?: CareItemView,
): CareChangeDraft {
  const id = crypto.randomUUID();
  return {
    id,
    itemId: item?.id ?? `mock-care-${id}`,
    kind,
    operation,
    version: item?.version ?? 0,
    fields: { ...(item?.fields ?? emptyCareFields) },
    answer: "",
    evidence: "",
  };
}
export function careStatusChoices(item: CareItemView): CareItemStatus[] {
  if (item.kind === "schedule")
    return item.status === "scheduled" ? ["completed", "cancelled"] : [];
  if (item.kind !== "task") return [];
  if (item.status === "not-started") return ["in-progress", "completed"];
  if (item.status === "in-progress") return ["completed"];
  return item.status === "completed" ? ["in-progress"] : [];
}
export function canApplyCareChange(
  space: CareSpaceView,
  draft: CareChangeDraft,
  item?: CareItemView,
) {
  return (
    space.role === "owner" ||
    (draft.operation === "status" &&
      item?.kind === "task" &&
      space.members.some(
        (member) => member.self && member.id === item.fields.assigneeId,
      ))
  );
}
export function careDraftError(
  draft: CareChangeDraft,
  item: CareItemView | undefined,
  space: CareSpaceView,
): string | undefined {
  if (
    !space.members.some((member) => member.self && member.role === space.role)
  )
    return "현재 공간의 참여 권한을 확인해 주세요.";
  if (draft.operation === "create") {
    if (!["schedule", "task", "question"].includes(draft.kind))
      return "관찰과 안내는 소식에서 추가해 주세요.";
    if (item || draft.version !== 0)
      return "이미 등록됐거나 현재 정보가 달라졌어요.";
  } else {
    if (!item || item.deletedAt)
      return "이미 삭제되었거나 찾을 수 없는 항목이에요.";
    if (item.version !== draft.version || item.kind !== draft.kind)
      return "검토 중 현재 정보가 변경됐어요. 최신 내용에서 다시 시작해 주세요.";
    if (item.needsReconfirmation)
      return "유효한 근거를 먼저 다시 확인해 주세요.";
    if (isConfirmedQuestion(item) && draft.operation !== "delete")
      return "답변 확인이 끝난 질문은 수정할 수 없어요.";
  }
  if (draft.operation === "create" || draft.operation === "edit") {
    if (Object.keys(validateCareFields(draft.kind, draft.fields)).length)
      return "필수 내용을 입력하고 날짜를 확인해 주세요.";
    if (
      draft.operation === "edit" &&
      JSON.stringify(item?.fields) === JSON.stringify(draft.fields)
    )
      return "변경할 내용을 입력해 주세요.";
  }
  if (
    (draft.operation === "create" ||
      draft.operation === "edit" ||
      draft.operation === "assignee") &&
    draft.fields.assigneeId &&
    !space.members.some((member) => member.id === draft.fields.assigneeId)
  )
    return "현재 참여 중인 담당자를 다시 선택해 주세요.";
  if (
    draft.operation === "assignee" &&
    (item?.kind !== "task" ||
      draft.fields.assigneeId === item.fields.assigneeId)
  )
    return "변경할 담당자를 선택해 주세요.";
  if (
    draft.operation === "status" &&
    (!item ||
      !draft.nextStatus ||
      !careStatusChoices(item).includes(draft.nextStatus))
  )
    return "현재 상태에서 변경 가능한 상태를 선택해 주세요.";
  if (
    draft.operation === "answer" &&
    (item?.kind !== "question" ||
      item.status !== "unconfirmed" ||
      !draft.answer.trim() ||
      !draft.evidence.trim())
  )
    return "답변과 어떻게 확인했는지 함께 입력해 주세요.";
}
export function nextCareStatus(draft: CareChangeDraft, item?: CareItemView) {
  return draft.operation === "answer"
    ? "confirmed"
    : draft.operation === "status"
      ? draft.nextStatus!
      : (item?.status ?? initialCareStatus(draft.kind));
}
