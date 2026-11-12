import { useState } from "react";
import { BottomSheet } from "@/components/feedback";
import { Button, Field, MenuRow, TextAction } from "@/components/ui";
import { DatePicker } from "@/components/ui/DatePicker";
import type { SpaceMember } from "@/features/carespace/api/spaceDetailTypes";
import type { CareDetail } from "../api/careReadTypes";
import type { CareItemKind } from "../model/careItemViewTypes";
import type { ReconfirmationDraft } from "../model/careReconfirmationDraft";
import { formatCareDate } from "../model/careItemFields";
import { CareFieldsForm } from "./CareFieldsForm";

function OptionalDate({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState(value);
  return (
    <>
      <MenuRow
        icon="care-brand"
        title={`${label} · ${formatCareDate(value)}`}
        disabled={disabled}
        onClick={() => {
          setSelection(value);
          setOpen(true);
        }}
      />
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={label}
        footer={
          <Button
            onClick={() => {
              onChange(selection);
              setOpen(false);
            }}
          >
            이 날짜로 선택
          </Button>
        }
      >
        <DatePicker
          value={selection}
          onChange={setSelection}
        />
        <TextAction onClick={() => setSelection("")}>
          날짜 정하지 않음
        </TextAction>
      </BottomSheet>
    </>
  );
}
export function CareReconfirmationInputs({
  item,
  draft,
  update,
  members,
  disabled,
  onTime,
}: {
  item: CareDetail;
  draft: ReconfirmationDraft;
  update: (value: ReconfirmationDraft) => void;
  members: SpaceMember[];
  disabled: boolean;
  onTime: () => void;
}) {
  return (
    <>
      <CareFieldsForm
        apiMode
        direct
        kind={item.itemType.toLowerCase() as CareItemKind}
        fields={draft.fields}
        onChange={(fields) => update({ ...draft, fields })}
        onTimeSelect={onTime}
        members={members.map((member) => ({
          id: member.membershipId,
          name: member.displayName || "이름 미설정",
          role: member.role.toLowerCase(),
        }))}
        disabled={disabled}
      />
      {item.itemType === "SCHEDULE" && draft.fields.time && (
        <TextAction
          disabled={disabled}
          onClick={() =>
            update({ ...draft, fields: { ...draft.fields, time: "" } })
          }
        >
          시간 정하지 않음
        </TextAction>
      )}
      {item.itemType === "OBSERVATION" && (
        <>
          <OptionalDate
            label="관찰 날짜 (선택)"
            value={draft.observedDate}
            onChange={(observedDate) => update({ ...draft, observedDate })}
            disabled={disabled}
          />
          <Field
            label="관찰 시각 (선택)"
            value={draft.observedTimeText}
            maxLength={10000}
            onChange={(event) =>
              update({ ...draft, observedTimeText: event.target.value })
            }
            disabled={disabled}
          />
        </>
      )}
      {item.itemType === "GUIDANCE" && (
        <>
          <Field
            label="안내 출처 (선택)"
            value={draft.sourceName}
            maxLength={10000}
            onChange={(event) =>
              update({ ...draft, sourceName: event.target.value })
            }
            disabled={disabled}
          />
          <OptionalDate
            label="안내 날짜 (선택)"
            value={draft.receivedDate}
            onChange={(receivedDate) => update({ ...draft, receivedDate })}
            disabled={disabled}
          />
        </>
      )}
      {item.itemType === "QUESTION" && item.status === "CONFIRMED" && (
        <Field
          label="다시 확인한 확정 답변"
          multiline
          rows={5}
          value={draft.confirmedAnswer}
          maxLength={10000}
          onChange={(event) =>
            update({ ...draft, confirmedAnswer: event.target.value })
          }
          disabled={disabled}
          helper="질문의 확인됨 상태를 유지하며 삭제된 근거를 대신할 답변을 함께 확인해요."
        />
      )}
    </>
  );
}
