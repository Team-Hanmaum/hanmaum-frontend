import type { CareItemFields } from "./careItemViewTypes";
import { emptyCareFields } from "./careItemFields";
import type {
  CreatableItemType,
  CreateCareItemBody,
} from "../api/careWriteTypes";
import type { CareSpaceSummary } from "@/features/carespace/api/careSpaceTypes";

export const createItemTypes: Record<string, CreatableItemType | undefined> = {
  schedule: "SCHEDULE",
  task: "TASK",
  question: "QUESTION",
};
export const emptyWriteFields = (): CareItemFields => ({ ...emptyCareFields });
// UI 입력 모델은 문자열을 사용하고, API의 미정 값은 명시적인 null로 보낸다.
export function createItemValues(
  type: CreatableItemType,
  fields: CareItemFields,
): Omit<CreateCareItemBody, "clientRequestId"> {
  const text = (value: string) => value.trim() || null;
  return {
    itemType: type,
    title: fields.title.trim(),
    description: text(fields.note),
    fields:
      type === "SCHEDULE"
        ? {
            scheduledDate: text(fields.date),
            scheduledTime: text(fields.time),
            location: text(fields.location),
          }
        : type === "TASK"
          ? {
              dueDate: text(fields.dueDate),
              assigneeMembershipId: fields.assigneeId || null,
            }
          : {},
  };
}
export function canCreateDirectly(
  space: CareSpaceSummary,
  type: CreatableItemType,
  fields: CareItemFields,
) {
  return (
    space.role === "OWNER" ||
    (type === "TASK" && fields.assigneeId === space.membershipId)
  );
}
export function writeFieldError(fields: CareItemFields) {
  if (!fields.title.trim()) return "이름 또는 질문 내용을 입력해 주세요.";
  if (Object.values(fields).some((value) => value.length > 10000))
    return "각 입력은 10,000자 이내로 작성해 주세요.";
  return "";
}
