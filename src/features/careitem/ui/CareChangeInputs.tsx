import { Field, SelectionRow } from "@/components/ui";
import { Notice } from "@/components/feedback";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { CareChangeDraft } from "../model/careChangeTypes";
import type { CareItemView } from "../model/careItemViewTypes";
import { careStatusLabels } from "../model/careItemStatus";
import { careStatusChoices } from "../model/careChangeRules";
import { CareFieldsForm } from "./CareFieldsForm";
import { CareSection } from "./CareSection";
import { validateCareFields } from "../model/careItemFields";

export function CareChangeInputs({
  draft,
  item,
  space,
  onChange,
  onTimeSelect,
  disabled,
  showErrors = false,
}: {
  draft: CareChangeDraft;
  item?: CareItemView;
  space: CareSpaceView;
  onChange: (draft: CareChangeDraft) => void;
  onTimeSelect: () => void;
  disabled: boolean;
  showErrors?: boolean;
}) {
  const { operation } = draft;
  return (
    <>
      {(operation === "create" || operation === "edit") && (
        <CareFieldsForm
          direct
          preserveTitle={operation === "edit" && draft.kind === "task"}
          kind={draft.kind}
          fields={draft.fields}
          onChange={(fields) => onChange({ ...draft, fields })}
          members={space.members}
          onTimeSelect={onTimeSelect}
          disabled={disabled}
          errors={
            showErrors
              ? validateCareFields(draft.kind, draft.fields)
              : undefined
          }
        />
      )}
      {operation === "assignee" && (
        <>
          <Notice
            title={`현재 담당자는 ${space.members.find((member) => member.id === item?.fields.assigneeId)?.name ?? "미지정"}이에요`}
            body="새 담당자를 한 명 선택하거나 미지정으로 남겨 주세요."
          />
          {[
            ...space.members.map((member) => ({
              id: member.id,
              label: `${member.name}${member.self ? " · 나" : ""}`,
            })),
            { id: "", label: "미지정" },
          ].map((member) => (
            <SelectionRow
              key={member.id}
              control="radio"
              name="care-assignee"
              label={member.label}
              checked={draft.fields.assigneeId === member.id}
              onChange={() =>
                onChange({
                  ...draft,
                  fields: { ...draft.fields, assigneeId: member.id },
                })
              }
              disabled={disabled}
            />
          ))}
        </>
      )}
      {operation === "status" && item && (
        <>
          {careStatusChoices(item).map((status) => (
            <SelectionRow
              key={status}
              control="radio"
              name="care-status"
              label={
                item.status === "completed"
                  ? "완료 취소 · 진행 중으로"
                  : `${careStatusLabels[status]}로 변경`
              }
              checked={draft.nextStatus === status}
              onChange={() => onChange({ ...draft, nextStatus: status })}
              disabled={disabled}
            />
          ))}
          <Notice
            title={
              item.kind === "schedule"
                ? "시간이 지나도 자동 완료하지 않아요"
                : "실제 진행 상태를 확인해요"
            }
            body={
              item.kind === "schedule"
                ? "일정이 실제로 끝났는지 확인한 뒤 바꿔 주세요."
                : "완료 취소는 진행 중으로 돌아가요."
            }
          />
        </>
      )}
      {operation === "answer" && (
        <>
          <CareSection title="질문">{item?.fields.content}</CareSection>
          <Field
            label="답변"
            error={
              showErrors && !draft.answer.trim()
                ? "답변을 입력해 주세요."
                : undefined
            }
            multiline
            rows={5}
            value={draft.answer}
            onChange={(event) =>
              onChange({ ...draft, answer: event.target.value })
            }
            disabled={disabled}
          />
        </>
      )}
      {(["edit", "assignee", "answer"] as string[]).includes(operation) && (
        <Field
          label={operation === "answer" ? "어떻게 확인했나요?" : "변경 근거"}
          error={
            showErrors && operation === "answer" && !draft.evidence.trim()
              ? "확인한 근거를 입력해 주세요."
              : undefined
          }
          multiline
          rows={5}
          value={draft.evidence}
          onChange={(event) =>
            onChange({ ...draft, evidence: event.target.value })
          }
          helper={
            operation === "answer"
              ? undefined
              : "이번 변경을 확인할 때 함께 보여줘요."
          }
          disabled={disabled}
        />
      )}
    </>
  );
}
