import { Notice } from "@/components/feedback";
import { SelectionRow } from "@/components/ui";
import type { CareDetail } from "../api/careReadTypes";
import type { CareItemFields, CareItemKind } from "../model/careItemViewTypes";
import type { SpaceMember } from "@/features/carespace/api/spaceDetailTypes";
import { displayCareValue } from "../model/careReadView";
import { itemStatusChoices } from "../model/careEditDraft";
import { CareFieldsForm } from "./CareFieldsForm";
export function CareEditInputs({
  item,
  operation,
  fields,
  onChange,
  status,
  onStatus,
  members,
  disabled,
  onTime,
}: {
  item: CareDetail;
  operation: "edit" | "assignee" | "status";
  fields: CareItemFields;
  onChange: (fields: CareItemFields) => void;
  status: string;
  onStatus: (value: string) => void;
  members: SpaceMember[];
  disabled: boolean;
  onTime: () => void;
}) {
  if (operation === "status")
    return (
      <>
        {itemStatusChoices(item).map((s) => (
          <SelectionRow
            key={s}
            control="radio"
            name="care-status"
            label={`${displayCareValue("status", s)}로 변경`}
            checked={status === s}
            onChange={() => onStatus(s)}
            disabled={disabled}
          />
        ))}
        <Notice
          title="실제 진행 상태를 확인해요"
          body={
            item.itemType === "SCHEDULE"
              ? "시간이 지나도 자동으로 완료하지 않아요."
              : "완료 취소는 진행 중으로 돌아가요."
          }
        />
      </>
    );
  if (operation === "assignee")
    return (
      <>
        <Notice
          title={`현재 담당자 · ${displayCareValue("assigneeMembershipId", item.fields?.assigneeMembershipId, members)}`}
          body="새 담당자를 한 명 선택하거나 미지정으로 남겨 주세요."
        />
        {[
          ...members.map((m) => ({
            id: m.membershipId,
            name: m.displayName || "이름 미설정",
          })),
          { id: "", name: "미지정" },
        ].map((m) => (
          <SelectionRow
            key={m.id}
            control="radio"
            name="care-assignee"
            label={m.name}
            checked={fields.assigneeId === m.id}
            onChange={() => onChange({ ...fields, assigneeId: m.id })}
            disabled={disabled}
          />
        ))}
      </>
    );
  return (
    <CareFieldsForm
      apiMode
      direct
      kind={item.itemType.toLowerCase() as CareItemKind}
      fields={fields}
      onChange={onChange}
      onTimeSelect={onTime}
      members={members.map((m) => ({
        id: m.membershipId,
        name: m.displayName || "이름 미설정",
        role: m.role.toLowerCase(),
      }))}
      disabled={disabled}
    />
  );
}
