import type { CareDetail, CareValues } from "../api/careReadTypes";
import type { CareItemFields } from "./careItemViewTypes";
import type { CareChangeOperation } from "./careChangeTypes";
import type { CareSpaceSummary } from "@/features/carespace/api/careSpaceTypes";
import { emptyWriteFields } from "./careWriteDraft";

const text = (value: unknown) => (typeof value === "string" ? value : "");
export function itemWriteFields(item: CareDetail): CareItemFields {
  return {
    ...emptyWriteFields(),
    title: item.title ?? "",
    note: item.description ?? "",
    date: text(item.fields?.scheduledDate),
    time: text(item.fields?.scheduledTime),
    location: text(item.fields?.location),
    dueDate: text(item.fields?.dueDate),
    assigneeId: text(item.fields?.assigneeMembershipId),
  };
}
export function itemStatusChoices(
  item: Pick<CareDetail, "itemType" | "status">,
): string[] {
  if (item.itemType === "SCHEDULE")
    return item.status === "SCHEDULED" ? ["COMPLETED", "CANCELED"] : [];
  if (item.itemType !== "TASK") return [];
  if (item.status === "NOT_STARTED") return ["IN_PROGRESS", "COMPLETED"];
  if (item.status === "IN_PROGRESS") return ["COMPLETED"];
  return item.status === "COMPLETED" ? ["IN_PROGRESS"] : [];
}
export function careWriteUnavailable(
  item: CareDetail,
  operation: CareChangeOperation,
) {
  if (item.visibility === "DELETED") return "이미 삭제된 항목이에요.";
  if (operation === "delete") return "";
  if (
    item.needsReconfirmation ||
    item.redactedFields.length ||
    item.title === null
  )
    return "유효한 근거를 다시 확인해야 하는 항목이에요.";
  if (item.itemType === "QUESTION" && item.status === "CONFIRMED")
    return "답변 확인이 끝난 질문은 수정하거나 다시 답변할 수 없어요.";
  if (operation === "assignee" && item.itemType !== "TASK")
    return "할 일의 담당자만 변경할 수 있어요.";
  if (operation === "status" && !itemStatusChoices(item).length)
    return "현재 상태에서는 변경할 수 없어요.";
  if (
    operation === "answer" &&
    (item.itemType !== "QUESTION" || item.status !== "UNCONFIRMED")
  )
    return "미확인 질문에만 답변할 수 있어요.";
  return "";
}
export function canChangeDirectly(
  space: CareSpaceSummary,
  item: CareDetail,
  operation: CareChangeOperation,
) {
  if (operation === "answer") return false;
  return (
    space.role === "OWNER" ||
    (operation === "status" &&
      item.itemType === "TASK" &&
      item.fields?.assigneeMembershipId === space.membershipId)
  );
}
// 서버의 PATCH 계약에 맞춰 변경된 값만 전달한다. 보이지 않는 필드는 덮어쓰지 않는다.
export function itemContentPatch(
  item: CareDetail,
  fields: CareItemFields,
  operation: "edit" | "assignee",
): CareValues {
  const initial = itemWriteFields(item);
  const values: CareValues = {};
  const patch: CareValues = {};
  const nullable = (v: string) => v.trim() || null;
  if (operation === "edit") {
    if (fields.title.trim() !== initial.title)
      values.title = fields.title.trim();
    if (nullable(fields.note) !== (item.description || null))
      values.description = nullable(fields.note);
  }
  const keys: Partial<Record<keyof CareItemFields, string>> =
    operation === "assignee"
      ? { assigneeId: "assigneeMembershipId" }
      : item.itemType === "TASK"
        ? { assigneeId: "assigneeMembershipId", dueDate: "dueDate" }
        : item.itemType === "SCHEDULE"
          ? {
              date: "scheduledDate",
              time: "scheduledTime",
              location: "location",
            }
          : {};
  for (const [key, apiKey] of Object.entries(keys)) {
    const field = key as keyof CareItemFields;
    if (nullable(fields[field]) !== nullable(initial[field]))
      patch[apiKey] = nullable(fields[field]);
  }
  if (Object.keys(patch).length) values.fields = patch;
  return values;
}
