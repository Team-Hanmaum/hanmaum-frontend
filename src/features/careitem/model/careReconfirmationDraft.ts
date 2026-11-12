import type { CareDetail, CareEvidence } from "../api/careReadTypes";
import type { ReconfirmCareItemBody } from "../api/careReconfirmationTypes";
import { itemWriteFields } from "./careEditDraft";
import { writeFieldError } from "./careWriteDraft";
import { validateCareFields } from "./careItemFields";
export function initialReconfirmationDraft(item: CareDetail) {
  const read = (key: string, value: unknown) =>
    item.redactedFields.some(
      (path) => path === key || path === `fields.${key}`,
    ) || typeof value !== "string"
      ? ""
      : value;
  const fields = itemWriteFields(item);
  return {
    fields: {
      ...fields,
      title: read("title", item.title),
      note: read("description", item.description),
      date: read("scheduledDate", item.fields?.scheduledDate),
      time: read("scheduledTime", item.fields?.scheduledTime),
      location: read("location", item.fields?.location),
      dueDate: read("dueDate", item.fields?.dueDate),
      assigneeId: read(
        "assigneeMembershipId",
        item.fields?.assigneeMembershipId,
      ),
    },
    observedDate: read("observedDate", item.fields?.observedDate),
    observedTimeText: read("observedTimeText", item.fields?.observedTimeText),
    receivedDate: read("receivedDate", item.fields?.receivedDate),
    sourceName: read("sourceName", item.fields?.sourceName),
    confirmedAnswer: read("confirmedAnswer", item.confirmedAnswer),
    basis: "",
    evidenceIds: [] as string[],
  };
}
export type ReconfirmationDraft = ReturnType<typeof initialReconfirmationDraft>;
export function reconfirmationValues(
  item: CareDetail,
  draft: ReconfirmationDraft,
): ReconfirmCareItemBody["values"] {
  const text = (value: string) => value.trim() || null;
  const fields = draft.fields;
  return {
    title: fields.title.trim(),
    description: text(fields.note),
    fields:
      item.itemType === "SCHEDULE"
        ? {
            scheduledDate: text(fields.date),
            scheduledTime: text(fields.time),
            location: text(fields.location),
          }
        : item.itemType === "TASK"
          ? {
              dueDate: text(fields.dueDate),
              assigneeMembershipId: text(fields.assigneeId),
            }
          : item.itemType === "OBSERVATION"
            ? {
                observedDate: text(draft.observedDate),
                observedTimeText: text(draft.observedTimeText),
              }
            : item.itemType === "GUIDANCE"
              ? {
                  receivedDate: text(draft.receivedDate),
                  sourceName: text(draft.sourceName),
                }
              : item.status === "CONFIRMED"
                ? { confirmedAnswer: text(draft.confirmedAnswer) }
                : {},
  };
}
export function reconfirmationError(
  item: CareDetail,
  draft: ReconfirmationDraft,
  evidence: CareEvidence[],
) {
  const error = writeFieldError(draft.fields);
  if (error) return error;
  if (item.itemType === "SCHEDULE") {
    const errors = validateCareFields("schedule", draft.fields);
    if (errors.date) return errors.date;
  }
  if (
    item.itemType === "QUESTION" &&
    item.status === "CONFIRMED" &&
    !draft.confirmedAnswer.trim()
  )
    return "확정 답변을 다시 확인해 입력해 주세요.";
  if (
    [
      draft.basis,
      draft.confirmedAnswer,
      draft.observedTimeText,
      draft.sourceName,
    ].some((value) => value.length > 10000)
  )
    return "각 입력은 10,000자 이내로 작성해 주세요.";
  if (!draft.basis.trim() && !draft.evidenceIds.length)
    return "어떻게 확인했는지 입력하거나 유효한 기존 근거를 선택해 주세요.";
  if (
    draft.evidenceIds.some(
      (id) =>
        !evidence.some(
          (entry) => entry.evidenceId === id && entry.status === "VALID",
        ),
    )
  )
    return "선택한 근거가 바뀌었어요. 유효한 근거를 다시 선택해 주세요.";
  return "";
}
